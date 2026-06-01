<?php

namespace App\Exception\Review;

use App\Entity\Enum\VideoStreamingFailureReason;
use Symfony\Component\HttpFoundation\Response;

final class VideoSourceNotFoundException extends ReviewException
{
    public const CODE = 6;

    public function __construct(string $reviewVersionUuid)
    {
        parent::__construct(
            sprintf('Source video file is missing on disk for review version %s.', $reviewVersionUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'reviewVersionUuid' => $reviewVersionUuid,
                'reason' => VideoStreamingFailureReason::InvalidSource->value,
            ],
        );
    }
}
