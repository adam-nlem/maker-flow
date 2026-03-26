<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class MissingWebhookSignatureException extends StripeException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'Missing Stripe-Signature header.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
