<?php

namespace App\Message\Handler;

use App\Entity\Enum\ScriptGenerationStatus;
use App\Helper\DateHelper;
use App\Message\GenerateScriptMessage;
use App\Repository\CreatorProfileRepository;
use App\Repository\ScriptGenerationRepository;
use App\Service\GeminiClientService;
use App\Service\PromptAssemblerService;
use App\Service\ScriptOutputParserService;
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

            // Parse output and create parts (scoped to this generation)
            $metadata = $this->outputParserService->parseAndCreateParts($output, $script, $user, $generation);

            if ($metadata->getTitle() !== null) {
                $script->setTitle($metadata->getTitle());
            }

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
}
