<?php

namespace App\Message\Handler;

use App\Entity\Enum\CreditTransactionType;
use App\Entity\Enum\SourceBucket;
use App\Exception\AiClient\AiClientRetryableException;
use App\Exception\Credit\InsufficientCreditsException;
use App\Message\GenerateChatMessageResponseMessage;
use App\Repository\MessageRepository;
use App\Service\AiClient\AiClientResolver;
use App\Service\ChatGeneration\ChatResponseProcessorService;
use App\Service\Credit\CreditService;
use App\Service\PromptAssembler\ChatPromptAssemblerService;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

use function Sentry\captureException;

#[AsMessageHandler]
class GenerateChatMessageResponseHandler
{
    private const MAX_RETRIES = 3;
    private const INITIAL_DELAY_MS = 2000;
    private const BACKOFF_MULTIPLIER = 2;

    public function __construct(
        private readonly MessageRepository $messageRepository,
        private readonly ChatPromptAssemblerService $chatPromptAssemblerService,
        private readonly AiClientResolver $aiClientResolver,
        private readonly ChatResponseProcessorService $chatResponseProcessorService,
        private readonly MessageBusInterface $messageBus,
        private readonly CreditService $creditService,
        private readonly EntityManagerInterface $entityManager,
        private readonly LoggerInterface $log,
    ) {}

    public function __invoke(GenerateChatMessageResponseMessage $message): void
    {
        $userMessage = $this->messageRepository->getById($message->getMessageId());

        if ($userMessage === null) {
            return;
        }

        $chat = $userMessage->getChat();
        $script = $chat->getScript();
        $user = $userMessage->getUser();
        $agency = $script?->getProject()?->getAgency();

        $debitedFromSubscription = $message->getDebitedFromSubscription();
        $debitedFromRefill = $message->getDebitedFromRefill();

        if ($agency === null) {
            $this->chatResponseProcessorService->createAiMessage(
                $chat,
                "Impossible de générer la réponse : ce chat n'est lié à aucune agence active. L'équipe a été alertée.",
            );
            $this->entityManager->flush();
            return;
        }

        if ($message->getRetryCount() === 0) {
            try {
                $transactions = $this->creditService->debitCredits($agency, 1, CreditTransactionType::ChatGeneration, $user);
                foreach ($transactions as $tx) {
                    if ($tx->getSourceBucket() === SourceBucket::SubscriptionCredits) {
                        $debitedFromSubscription = abs($tx->getAmount());
                    } else {
                        $debitedFromRefill = abs($tx->getAmount());
                    }
                }
            } catch (InsufficientCreditsException $e) {
                $this->chatResponseProcessorService->createAiMessage($chat, 'Crédits insuffisants pour effectuer cette action.');
                $this->entityManager->flush();
                return;
            }
        }

        try {
            $prompt = $this->chatPromptAssemblerService->assemble($chat, $userMessage);

            $output = $this->aiClientResolver->resolve($chat->getAiModel())->generateScript($prompt);

            $this->chatResponseProcessorService->processOutput($output, $chat, $script, $user);
        } catch (AiClientRetryableException $e) {
            if ($message->getRetryCount() < self::MAX_RETRIES) {
                $delay = $this->calculateRetryDelay($message->getRetryCount());

                $this->messageBus->dispatch(
                    new GenerateChatMessageResponseMessage(
                        $message->getMessageId(),
                        $message->getRetryCount() + 1,
                        $debitedFromSubscription,
                        $debitedFromRefill,
                    ),
                    [new DelayStamp($delay)],
                );

                return;
            }

            captureException($e);
            $this->handlePermanentFailure($chat, $agency, $user, $debitedFromSubscription, $debitedFromRefill);
            return;
        } catch (\Exception $e) {
            captureException($e);
            $this->handlePermanentFailure($chat, $agency, $user, $debitedFromSubscription, $debitedFromRefill);
            return;
        }

        $this->entityManager->flush();
    }

    private function handlePermanentFailure($chat, $agency, $user, int $debitedFromSubscription, int $debitedFromRefill): void
    {
        if ($debitedFromSubscription > 0) {
            try {
                $this->creditService->refundCredit(
                    $agency,
                    $debitedFromSubscription,
                    CreditTransactionType::ChatGenerationRefund,
                    SourceBucket::SubscriptionCredits,
                    null,
                    $user,
                );
            } catch (\Throwable $e) {
                captureException($e);
            }
        }

        if ($debitedFromRefill > 0) {
            try {
                $this->creditService->refundCredit(
                    $agency,
                    $debitedFromRefill,
                    CreditTransactionType::ChatGenerationRefund,
                    SourceBucket::RefillCredits,
                    null,
                    $user,
                );
            } catch (\Throwable $e) {
                captureException($e);
            }
        }

        $this->chatResponseProcessorService->createAiMessage($chat, "Une erreur est survenue lors de la génération. Votre crédit a été remboursé.");
        $this->entityManager->flush();
    }

    private function calculateRetryDelay(int $retryCount): int
    {
        return self::INITIAL_DELAY_MS * (self::BACKOFF_MULTIPLIER ** $retryCount);
    }
}
