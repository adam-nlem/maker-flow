<?php

namespace App\Exception\Credit;

use Symfony\Component\HttpFoundation\Response;

final class InsufficientCreditsException extends CreditException
{
    public const CODE = 1;

    public function __construct(
        private readonly int $requested,
        private readonly int $available,
    ) {
        parent::__construct(
            sprintf('Insufficient credits: requested %d, available %d', $requested, $available),
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
            ['requested' => $requested, 'available' => $available],
        );
    }

    public function getRequested(): int
    {
        return $this->requested;
    }

    public function getAvailable(): int
    {
        return $this->available;
    }
}
