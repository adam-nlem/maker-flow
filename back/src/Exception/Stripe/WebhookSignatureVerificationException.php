<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class WebhookSignatureVerificationException extends StripeException
{
    public const CODE = 2;

    public function __construct(
        ?\Throwable $previous = null
    ) {
        parent::__construct(
            'Webhook signature verification failed.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            [],
            $previous
        );
    }
}
