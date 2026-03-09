<?php

namespace App\Service\Otp\Exception;

class ExpiredOtpException extends OtpServiceException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct('The OTP code has expired.', self::CODE);
    }
}
