<?php

namespace App\Message\Handler;

use App\Entity\Enum\VideoStreamingFailureReason;
use App\Entity\Enum\VideoStreamingStatus;
use App\Exception\Review\VideoSourceNotFoundException;
use App\Message\ProcessReviewVideoMessage;
use App\Repository\ReviewVersionRepository;
use App\Service\Review\ReviewVideoStreamingService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class ProcessReviewVideoHandler
{
    public function __construct(
        private readonly ReviewVersionRepository $reviewVersionRepository,
        private readonly ReviewVideoStreamingService $reviewVideoStreamingService,
    ) {}

    public function __invoke(ProcessReviewVideoMessage $message): void
    {
        $reviewVersion = $this->reviewVersionRepository->getById($message->getReviewVersionId());

        if ($reviewVersion === null || $reviewVersion->getVideoStreamingStatus() === VideoStreamingStatus::Ready) {
            return;
        }

        $reviewVersion->setVideoStreamingStatus(VideoStreamingStatus::Processing);
        $reviewVersion->setVideoStreamingFailureReason(null);
        $this->reviewVersionRepository->save($reviewVersion, true);

        try {
            $this->reviewVideoStreamingService->generateCover($reviewVersion);
        } catch (\Throwable $coverException) {
            captureException($coverException);
        }

        try {
            $this->reviewVideoStreamingService->generateHls($reviewVersion);
        } catch (\Throwable $exception) {
            captureException($exception);

            $reviewVersion->setVideoStreamingStatus(VideoStreamingStatus::Failed);
            $reviewVersion->setVideoStreamingFailureReason(
                $exception instanceof VideoSourceNotFoundException
                    ? VideoStreamingFailureReason::InvalidSource
                    : VideoStreamingFailureReason::ProcessingError,
            );
            $this->reviewVersionRepository->save($reviewVersion, true);

            return;
        }

        $reviewVersion->setVideoStreamingStatus(VideoStreamingStatus::Ready);
        $this->reviewVersionRepository->save($reviewVersion, true);
    }
}
