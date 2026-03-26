<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class TokenExpiredException extends AuthException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'Authentication token has expired.',
            self::CODE,
            Response::HTTP_UNAUTHORIZED,
        );
    }
}
