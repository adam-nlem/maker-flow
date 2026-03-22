<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class SubscriptionManagementException extends StripeException
{
    public const CODE = 3;

    public function __construct(
        string $message,
        ?\Throwable $previous = null
    ) {
        parent::__construct(
            $message,
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            [],
            $previous
        );
    }
}
