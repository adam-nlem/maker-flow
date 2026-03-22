<?php

namespace App\Exception\Otp;

use Symfony\Component\HttpFoundation\Response;

final class ExpiredOtpException extends OtpException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'The OTP code has expired.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }
}
