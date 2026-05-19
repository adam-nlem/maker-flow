<?php

namespace App\Exception\PostDraft;

use App\Entity\Enum\VideoStreamingFailureReason;
use Symfony\Component\HttpFoundation\Response;

final class VideoSourceNotFoundException extends PostDraftException
{
    public const CODE = 6;

    public function __construct(string $mediaVersionUuid)
    {
        parent::__construct(
            sprintf('Source video file is missing on disk for media version %s.', $mediaVersionUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'mediaVersionUuid' => $mediaVersionUuid,
                'reason' => VideoStreamingFailureReason::InvalidSource->value,
            ],
        );
    }
}
