<?php

namespace App\Message\Handler;

use App\Message\SyncReferrerSegmentsMessage;
use App\Repository\UserRepository;
use App\Exception\Mailing\MailingRetryableException;
use App\Service\Prelaunch\PrelaunchService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Messenger\Stamp\DelayStamp;

use function Sentry\captureException;

#[AsMessageHandler]
class SyncReferrerSegmentsHandler
{
    private const MAX_RETRIES = 3;
    private const INITIAL_DELAY_MS = 2000;
    private const BACKOFF_MULTIPLIER = 2;

    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly PrelaunchService $prelaunchService,
        private readonly MessageBusInterface $messageBus,
    ) {}

    public function __invoke(SyncReferrerSegmentsMessage $message): void
    {
        $referrer = $this->userRepository->find($message->getReferrerId());

        if ($referrer === null) {
            return;
        }

        try {
            $this->prelaunchService->syncReferrerSegments($referrer);
        } catch (MailingRetryableException $e) {
            if ($message->getRetryCount() < self::MAX_RETRIES) {
                $delay = self::INITIAL_DELAY_MS * (self::BACKOFF_MULTIPLIER ** $message->getRetryCount());

                $this->messageBus->dispatch(
                    new SyncReferrerSegmentsMessage(
                        $message->getReferrerId(),
                        $message->getRetryCount() + 1,
                    ),
                    [new DelayStamp($delay)],
                );

                return;
            }

            captureException($e);
        } catch (\Throwable $e) {
            captureException($e);
        }
    }
}
