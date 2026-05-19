<?php

namespace App\Message\Handler;

use App\Entity\Enum\VideoStreamingFailureReason;
use App\Entity\Enum\VideoStreamingStatus;
use App\Exception\PostDraft\VideoSourceNotFoundException;
use App\Message\ProcessPostDraftVideoMessage;
use App\Repository\PostDraftMediaVersionRepository;
use App\Service\PostDraft\PostDraftVideoStreamingService;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;

use function Sentry\captureException;

#[AsMessageHandler]
class ProcessPostDraftVideoHandler
{
    public function __construct(
        private readonly PostDraftMediaVersionRepository $postDraftMediaVersionRepository,
        private readonly PostDraftVideoStreamingService $postDraftVideoStreamingService,
    ) {}

    public function __invoke(ProcessPostDraftVideoMessage $message): void
    {
        $mediaVersion = $this->postDraftMediaVersionRepository->getById($message->getMediaVersionId());

        if ($mediaVersion === null || $mediaVersion->getVideoStreamingStatus() === VideoStreamingStatus::Ready) {
            return;
        }

        $mediaVersion->setVideoStreamingStatus(VideoStreamingStatus::Processing);
        $mediaVersion->setVideoStreamingFailureReason(null);
        $this->postDraftMediaVersionRepository->save($mediaVersion, true);

        try {
            $this->postDraftVideoStreamingService->generateHls($mediaVersion);
        } catch (\Throwable $exception) {
            captureException($exception);

            $mediaVersion->setVideoStreamingStatus(VideoStreamingStatus::Failed);
            $mediaVersion->setVideoStreamingFailureReason(
                $exception instanceof VideoSourceNotFoundException
                    ? VideoStreamingFailureReason::InvalidSource
                    : VideoStreamingFailureReason::ProcessingError,
            );
            $this->postDraftMediaVersionRepository->save($mediaVersion, true);

            return;
        }

        $mediaVersion->setVideoStreamingStatus(VideoStreamingStatus::Ready);
        $this->postDraftMediaVersionRepository->save($mediaVersion, true);
    }
}
