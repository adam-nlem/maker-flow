<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class MissingCredentialsException extends AuthException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'You have to provide an email and a password.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
