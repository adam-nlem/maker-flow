<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class UnresolvableReviewVersionAgencyException extends ReviewException
{
    public const CODE = 5;

    public function __construct(string $reviewVersionUuid)
    {
        parent::__construct(
            sprintf('Cannot resolve agency for review version %s.', $reviewVersionUuid),
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            ['reviewVersionUuid' => $reviewVersionUuid],
        );
    }
}
