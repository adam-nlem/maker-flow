<?php

namespace App\Exception\User;

use Symfony\Component\HttpFoundation\Response;

final class MissingPasswordFieldsException extends UserException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'All three password fields are required.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
