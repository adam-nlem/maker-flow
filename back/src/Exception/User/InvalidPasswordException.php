<?php

namespace App\Exception\User;

use Symfony\Component\HttpFoundation\Response;

final class InvalidPasswordException extends UserException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Password does not meet security requirements.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
