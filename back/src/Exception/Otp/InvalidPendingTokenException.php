<?php

namespace App\Exception\Otp;

use Symfony\Component\HttpFoundation\Response;

final class InvalidPendingTokenException extends OtpException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'The pending OTP token is invalid or expired.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY
        );
    }
}
