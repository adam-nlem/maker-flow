<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class InvalidTokenException extends AuthException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'Authentication token is invalid.',
            self::CODE,
            Response::HTTP_UNAUTHORIZED,
        );
    }
}
