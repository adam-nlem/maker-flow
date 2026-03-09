<?php

namespace App\Service\Otp\Exception;

class InvalidPendingTokenException extends OtpServiceException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct('Invalid or expired OTP session.', self::CODE);
    }
}
