<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class ReviewLockedException extends ReviewException
{
    public const CODE = 4;

    public function __construct(array $meta = [])
    {
        parent::__construct(
            'This review cannot be modified in its current status.',
            self::CODE,
            Response::HTTP_CONFLICT,
            $meta,
        );
    }
}
