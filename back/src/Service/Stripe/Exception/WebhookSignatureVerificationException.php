<?php

namespace App\Service\Stripe\Exception;

class WebhookSignatureVerificationException extends StripeServiceException
{
    public const CODE = 2;

    public function __construct(?\Throwable $previous = null)
    {
        parent::__construct('Webhook signature verification failed', self::CODE, $previous);
    }
}
