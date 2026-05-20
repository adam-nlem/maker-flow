<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewVersionNotLatestException extends ReviewException
{
    public const CODE = 10;

    public function __construct()
    {
        parent::__construct(
            'This review version is no longer the latest one of its review.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
