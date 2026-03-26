<?php

namespace App\Exception\User;

use Symfony\Component\HttpFoundation\Response;

final class IncorrectCurrentPasswordException extends UserException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Current password is incorrect.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
