<?php

namespace App\Message\Handler;

use App\Message\SyncReferrerSegmentsMessage;
use App\Repository\UserRepository;
use App\Service\Prelaunch\PrelaunchService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class SyncReferrerSegmentsHandler
{
    public function __construct(
        private readonly UserRepository $userRepository,
        private readonly PrelaunchService $prelaunchService,
    ) {}

    public function __invoke(SyncReferrerSegmentsMessage $message): void
    {
        try {
            $referrer = $this->userRepository->find($message->getReferrerId());

            if ($referrer === null) {
                return;
            }

            $this->prelaunchService->syncReferrerSegments($referrer);
        } catch (\Throwable $e) {
            captureException($e);
        }
    }
}
