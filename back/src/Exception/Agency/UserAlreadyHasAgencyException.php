<?php

namespace App\Exception\Agency;

use Symfony\Component\HttpFoundation\Response;

final class UserAlreadyHasAgencyException extends AgencyException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'The current user already belongs to an agency.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
