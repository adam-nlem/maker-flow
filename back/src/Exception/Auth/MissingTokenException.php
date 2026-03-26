<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class MissingTokenException extends AuthException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'No authentication token found.',
            self::CODE,
            Response::HTTP_UNAUTHORIZED,
        );
    }
}
