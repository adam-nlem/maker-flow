<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class SubscriptionNotFoundException extends StripeException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'No active subscription found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
