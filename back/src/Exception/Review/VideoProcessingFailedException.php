<?php

namespace App\Exception\Review;

use App\Entity\Enum\VideoStreamingFailureReason;
use Symfony\Component\HttpFoundation\Response;

final class VideoProcessingFailedException extends ReviewException
{
    public const CODE = 7;

    public function __construct(string $reviewVersionUuid, string $details, ?\Throwable $previous = null)
    {
        parent::__construct(
            sprintf('Video processing failed for review version %s: %s', $reviewVersionUuid, $details),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'reviewVersionUuid' => $reviewVersionUuid,
                'reason' => VideoStreamingFailureReason::ProcessingError->value,
            ],
            $previous,
        );
    }
}
