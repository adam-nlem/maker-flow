<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class StorageLimitReachedException extends ReviewException
{
    public const CODE = 24;

    public function __construct()
    {
        parent::__construct(
            'Storage limit reached for this plan.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
