<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewVersionNotPendingException extends ReviewException
{
    public const CODE = 8;

    public function __construct()
    {
        parent::__construct(
            'This action requires the review version to be pending.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
