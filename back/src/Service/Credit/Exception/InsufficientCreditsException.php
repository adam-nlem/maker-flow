<?php

namespace App\Service\Credit\Exception;

class InsufficientCreditsException extends CreditServiceException
{
    public const CODE = 1;

    public function __construct(
        private readonly int $requested,
        private readonly int $available,
    ) {
        parent::__construct(
            sprintf('Insufficient credits: requested %d, available %d', $requested, $available),
            self::CODE
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
