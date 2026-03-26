<?php

namespace App\Exception\Otp;

use Symfony\Component\HttpFoundation\Response;

final class ExpiredOtpSessionException extends OtpException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'The OTP session is invalid or expired.',
            self::CODE,
            Response::HTTP_UNAUTHORIZED,
        );
    }
}
