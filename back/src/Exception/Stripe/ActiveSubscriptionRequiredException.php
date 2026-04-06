<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class ActiveSubscriptionRequiredException extends StripeException
{
    public const CODE = 6;

    public function __construct()
    {
        parent::__construct(
            'Active subscription required.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
