<?php

namespace App\Service\Otp\Exception;

class MaxAttemptsOtpException extends OtpServiceException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct('Maximum verification attempts reached. Please request a new code.', self::CODE);
    }
}
