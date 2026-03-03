<?php

namespace App\Service\Stripe\Exception;

class SubscriptionManagementException extends StripeServiceException
{
    public const CODE = 3;

    public function __construct(string $reason, ?\Throwable $previous = null)
    {
        parent::__construct(
            sprintf('Subscription management failed: %s', $reason),
            self::CODE,
            $previous
        );
    }
}
