<?php

namespace App\Exception\PostDraft;

use App\Entity\Enum\VideoStreamingFailureReason;
use Symfony\Component\HttpFoundation\Response;

final class VideoProcessingFailedException extends PostDraftException
{
    public const CODE = 7;

    public function __construct(string $mediaVersionUuid, string $details, ?\Throwable $previous = null)
    {
        parent::__construct(
            sprintf('Video processing failed for media version %s: %s', $mediaVersionUuid, $details),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'mediaVersionUuid' => $mediaVersionUuid,
                'reason' => VideoStreamingFailureReason::ProcessingError->value,
            ],
            $previous,
        );
    }
}
