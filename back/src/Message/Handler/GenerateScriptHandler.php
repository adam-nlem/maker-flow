<?php

namespace App\Message\Handler;

use App\Entity\Enum\CreditTransactionType;
use App\Entity\Enum\ScriptGenerationStatus;
use App\Entity\Enum\SourceBucket;
use App\Helper\DateHelper;
use App\Message\GenerateScriptMessage;
use App\Repository\CreatorProfileRepository;
use App\Repository\ScriptGenerationRepository;
use App\Service\AiClient\AiClientResolver;
use App\Exception\AiClient\AiClientRetryableException;
use App\Service\Credit\CreditService;
use App\Exception\Credit\InsufficientCreditsException;
use App\Service\PromptAssembler\PromptAssemblerService;
use App\Service\ScriptOutputParser\ScriptOutputParserService;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

use function Sentry\captureException;

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
        private readonly AiClientResolver $aiClientResolver,
        private readonly ScriptOutputParserService $outputParserService,
        private readonly MessageBusInterface $messageBus,
        private readonly CreditService $creditService,
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

        // Track which buckets were debited so we can refund the exact same buckets on failure.
        // On the first attempt (retryCount=0) we debit here; on retries the amounts are carried
        // from the original message so we never double-charge.
        $debitedFromSubscription = $message->getDebitedFromSubscription();
        $debitedFromRefill = $message->getDebitedFromRefill();

        if ($message->getRetryCount() === 0) {
            try {
                $transactions = $this->creditService->debitCredits($user, 1, CreditTransactionType::ScriptGeneration);
                foreach ($transactions as $tx) {
                    if ($tx->getSourceBucket() === SourceBucket::SubscriptionCredits) {
                        $debitedFromSubscription = abs($tx->getAmount());
                    } else {
                        $debitedFromRefill = abs($tx->getAmount());
                    }
                }
            } catch (InsufficientCreditsException $e) {
                $generation->setStatus(ScriptGenerationStatus::Failed)
                    ->setErrorMessage('Insufficient credits.')
                    ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
                $this->generationRepository->save($generation, true);
                return;
            }
        }

        try {
            // Load creator profile
            $creatorProfile = $this->creatorProfileRepository->getByProjectAndUser(
                $script->getProject(),
                $user,
            );

            // Assemble the prompt
            $prompt = $this->promptAssemblerService->   assemble($creatorProfile, $generation);
            $generation->setAssembledPrompt($prompt);

            // Call the selected AI model
            $output = $this->aiClientResolver->resolve($generation->getAiModel())->generateScript($prompt);

            // Parse output and create parts (scoped to this generation)
            $this->outputParserService->parseAndCreateParts($output, $script, $user, $generation);

            // Mark as completed
            $generation->setStatus(ScriptGenerationStatus::Completed)
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        } catch (AiClientRetryableException $e) {
            if ($message->getRetryCount() < self::MAX_RETRIES) {
                $delay = $this->calculateRetryDelay($message->getRetryCount());

                $this->messageBus->dispatch(
                    new GenerateScriptMessage(
                        $generation->getId(),
                        $message->getRetryCount() + 1,
                        $debitedFromSubscription,
                        $debitedFromRefill,
                    ),
                    [new DelayStamp($delay)],
                );

                // Keep status at Processing — don't flush Failed, don't refund yet
                return;
            }

            captureException($e);

            $generation->setStatus(ScriptGenerationStatus::Failed)
                ->setErrorMessage('Script generation failed after multiple attempts.')
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        } catch (\Exception $e) {
            captureException($e);
            $generation->setStatus(ScriptGenerationStatus::Failed)
                ->setErrorMessage('An unexpected error occurred during script generation.')
                ->setCompletedAt(DateHelper::createUtcDateTimeImmutable());
        }

        // Refund credits to the original bucket(s) on permanent failure
        if ($generation->getStatus() === ScriptGenerationStatus::Failed) {
            if ($debitedFromSubscription > 0) {
                try {
                    $this->creditService->refundCredit(
                        $user,
                        $debitedFromSubscription,
                        CreditTransactionType::ScriptGenerationRefund,
                        SourceBucket::SubscriptionCredits,
                    );
                } catch (\Throwable $e) {
                    captureException($e);
                }
            }
            if ($debitedFromRefill > 0) {
                try {
                    $this->creditService->refundCredit(
                        $user,
                        $debitedFromRefill,
                        CreditTransactionType::ScriptGenerationRefund,
                        SourceBucket::RefillCredits,
                    );
                } catch (\Throwable $e) {
                    captureException($e);
                }
            }
        }

        $this->generationRepository->save($generation, true);
    }

    private function calculateRetryDelay(int $retryCount): int
    {
        return self::INITIAL_DELAY_MS * (self::BACKOFF_MULTIPLIER ** $retryCount);
    }
}
