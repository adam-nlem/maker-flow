<?php

namespace App\Exception\Otp;

use Symfony\Component\HttpFoundation\Response;

final class MaxAttemptsOtpException extends OtpException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Maximum OTP attempts reached.',
            self::CODE,
            Response::HTTP_TOO_MANY_REQUESTS
        );
    }
}
