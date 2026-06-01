<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class CoverGenerationFailedException extends ReviewException
{
    public const CODE = 22;

    public function __construct(string $reviewVersionUuid, string $details, ?\Throwable $previous = null)
    {
        parent::__construct(
            sprintf('Cover generation failed for review version %s: %s', $reviewVersionUuid, $details),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            [
                'reviewVersionUuid' => $reviewVersionUuid,
            ],
            $previous,
        );
    }
}
