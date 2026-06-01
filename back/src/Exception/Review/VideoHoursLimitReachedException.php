<?php

namespace App\Exception\Review;

use Symfony\Component\HttpFoundation\Response;

final class VideoHoursLimitReachedException extends ReviewException
{
    public const CODE = 23;

    public function __construct()
    {
        parent::__construct(
            'Video upload hours limit reached for this plan.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
