<?php

namespace App\Message\Handler;

use App\Entity\Enum\ScriptGenerationStatus;
use App\Helper\DateHelper;
use App\Message\GenerateScriptMessage;
use App\Repository\CreatorProfileRepository;
use App\Repository\ScriptChapterRepository;
use App\Repository\ScriptDialogueRepository;
use App\Repository\ScriptGenerationRepository;
use App\Repository\ScriptShotRepository;
use App\Repository\ScriptTextRepository;
use App\Repository\ScriptVoiceOverRepository;
use App\Service\GeminiClientService;
use App\Service\PromptAssemblerService;
use App\Service\ScriptOutputParserService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

#[AsMessageHandler]
class GenerateScriptHandler
{
    public function __construct(
        private readonly ScriptGenerationRepository $generationRepository,
        private readonly CreatorProfileRepository $creatorProfileRepository,
        private readonly PromptAssemblerService $promptAssemblerService,
        private readonly GeminiClientService $geminiClientService,
        private readonly ScriptOutputParserService $outputParserService,
        private readonly ScriptChapterRepository $chapterRepository,
        private readonly ScriptVoiceOverRepository $voiceOverRepository,
        private readonly ScriptDialogueRepository $dialogueRepository,
        private readonly ScriptShotRepository $shotRepository,
        private readonly ScriptTextRepository $textRepository,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $log,
    ) {}

    public function __invoke(GenerateScriptMessage $message): void
    {
        $generation = $this->generationRepository->getById($message->getScriptGenerationId());

        if ($generation === null) {
            return;
        }

        $script = $generation->getScript();
        $user = $generation->getUser();

        // Set status to processing
        $generation->setStatus(ScriptGenerationStatus::Processing);

        try {
            // Load creator profile
            $creatorProfile = $this->creatorProfileRepository->getByProjectAndUser(
                $script->getProject(),
                $user,
            );

            // Assemble the prompt
            $prompt = $this->promptAssemblerService->assemble($creatorProfile, $generation);
            $generation->setAssembledPrompt($prompt);

            // Call Gemini API
            $output = $this->geminiClientService->generateScript($prompt);

            // Only delete existing parts AFTER successful API call
            if ($generation->isReplaceExisting()) {
                $this->deleteExistingParts($script);
            }

            // Parse output and create parts
            $startPosition = $generation->isReplaceExisting()
                ? 0
                : $this->outputParserService->getMaxPositionForScript($script) + 1;

            $this->outputParserService->parseAndCreateParts($output, $script, $user, $startPosition);

            // Mark as completed
            $generation->setStatus(ScriptGenerationStatus::Completed)
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        } catch (\Exception $e) {
            $this->log->error('Script generation failed: ' . $e->getMessage());
            $generation->setStatus(ScriptGenerationStatus::Failed)
                ->setErrorMessage($e->getMessage())
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        }

        $this->generationRepository->save($generation, true);
    }

    private function deleteExistingParts($script): void
    {
        foreach ($script->getScriptChapters() as $chapter) {
            $this->chapterRepository->remove($chapter);
        }
        foreach ($script->getScriptVoiceOvers() as $voiceOver) {
            $this->voiceOverRepository->remove($voiceOver);
        }
        foreach ($script->getScriptDialogues() as $dialogue) {
            $this->dialogueRepository->remove($dialogue);
        }
        foreach ($script->getScriptShots() as $shot) {
            $this->shotRepository->remove($shot);
        }
        foreach ($script->getScriptTexts() as $text) {
            $this->textRepository->remove($text);
        }
        $this->entityManager->flush();
    }
}
