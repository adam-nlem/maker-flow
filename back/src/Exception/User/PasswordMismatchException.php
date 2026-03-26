<?php

namespace App\Exception\User;

use Symfony\Component\HttpFoundation\Response;

final class PasswordMismatchException extends UserException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Passwords do not match.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
