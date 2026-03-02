<?php

namespace App\Service\Stripe\Exception;

class CheckoutSessionCreationException extends StripeServiceException
{
    public const CODE = 1;

    public function __construct(string $reason, ?\Throwable $previous = null)
    {
        parent::__construct(
            sprintf('Failed to create checkout session: %s', $reason),
            self::CODE,
            $previous
        );
    }
}
