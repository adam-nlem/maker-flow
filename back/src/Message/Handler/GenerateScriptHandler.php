<?php

namespace App\Message\Handler;

use App\Entity\Enum\ScriptGenerationStatus;
use App\Helper\DateHelper;
use App\Message\GenerateScriptMessage;
use App\Repository\CreatorProfileRepository;
use App\Repository\ScriptGenerationRepository;
use App\Service\GeminiClient\Exception\GeminiRetryableException;
use App\Service\GeminiClient\GeminiClientService;
use App\Service\PromptAssembler\PromptAssemblerService;
use App\Service\ScriptOutputParser\ScriptOutputParserService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

#[AsMessageHandler]
class GenerateScriptHandler
{
    private const MAX_RETRIES = 3;
    private const INITIAL_DELAY_MS = 2000;
    private const BACKOFF_MULTIPLIER = 2;

    public function __construct(
        private readonly ScriptGenerationRepository $generationRepository,
        private readonly CreatorProfileRepository $creatorProfileRepository,
        private readonly PromptAssemblerService $promptAssemblerService,
        private readonly GeminiClientService $geminiClientService,
        private readonly ScriptOutputParserService $outputParserService,
        private readonly MessageBusInterface $messageBus,
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

        // Set status to processing and flush immediately so the frontend sees it
        $generation->setStatus(ScriptGenerationStatus::Processing);
        $this->generationRepository->save($generation, true);

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
        } catch (GeminiRetryableException $e) {
            if ($message->getRetryCount() < self::MAX_RETRIES) {
                $delay = $this->calculateRetryDelay($message->getRetryCount());

                $this->messageBus->dispatch(
                    new GenerateScriptMessage($generation->getId(), $message->getRetryCount() + 1),
                    [new DelayStamp($delay)],
                );

                // Keep status at Processing — don't flush Failed
                return;
            }

            $generation->setStatus(ScriptGenerationStatus::Failed)
                ->setErrorMessage($e->getMessage())
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        } catch (\Exception $e) {
            $generation->setStatus(ScriptGenerationStatus::Failed)
                ->setErrorMessage($e->getMessage())
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        }

        $this->generationRepository->save($generation, true);
    }

    private function calculateRetryDelay(int $retryCount): int
    {
        return self::INITIAL_DELAY_MS * (self::BACKOFF_MULTIPLIER ** $retryCount);
    }
}
