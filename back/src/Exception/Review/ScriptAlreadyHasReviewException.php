<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ScriptAlreadyHasReviewException extends ReviewException
{
    public const CODE = 3;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'The selected script already has a review.',
            self::CODE,
            Response::HTTP_CONFLICT,
            $meta,
        );
    }
}
