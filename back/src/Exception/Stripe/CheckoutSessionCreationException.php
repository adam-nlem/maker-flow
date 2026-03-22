<?php

namespace App\Exception\Stripe;

use Symfony\Component\HttpFoundation\Response;

final class CheckoutSessionCreationException extends StripeException
{
    public const CODE = 1;

    public function __construct(
        string $reason,
        ?\Throwable $previous = null
    ) {
        parent::__construct(
            $reason,
            self::CODE,
            Response::HTTP_BAD_REQUEST,
            [],
            $previous
        );
    }
}
