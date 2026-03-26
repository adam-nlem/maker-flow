<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class InvalidCredentialsException extends AuthException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Wrong email or password.',
            self::CODE,
            Response::HTTP_UNAUTHORIZED,
        );
    }
}
