<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class CoverSourceNotFoundException extends ReviewException
{
    public const CODE = 21;

    public function __construct(string $reviewVersionUuid)
    {
        parent::__construct(
            sprintf('Source video file is missing on disk for cover extraction of review version %s.', $reviewVersionUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'reviewVersionUuid' => $reviewVersionUuid,
            ],
        );
    }
}
