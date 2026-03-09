<?php

namespace App\Service\Otp\Exception;

class InvalidOtpException extends OtpServiceException
{
    public const CODE = 1;

    public function __construct(
        private readonly int $remainingAttempts,
    ) {
        parent::__construct('The OTP code is invalid.', self::CODE);
    }

    public function getRemainingAttempts(): int
    {
        return $this->remainingAttempts;
    }
}
