<?php

namespace App\Exception\Auth;

use Symfony\Component\HttpFoundation\Response;

final class EmailNotVerifiedException extends AuthException
{
    public const CODE = 6;

    public function __construct()
    {
        parent::__construct(
            'Email is not verified.',
            self::CODE,
            Response::HTTP_FORBIDDEN,
        );
    }
}
