<?php

namespace App\Exception\Otp;

use Symfony\Component\HttpFoundation\Response;

final class InvalidOtpException extends OtpException
{
    public const CODE = 1;

    public function __construct(
        private readonly int $remainingAttempts,
    ) {
        parent::__construct(
            'The OTP code is invalid.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
            ['remainingAttempts' => $remainingAttempts],
        );
    }

    public function getRemainingAttempts(): int
    {
        return $this->remainingAttempts;
    }
}
