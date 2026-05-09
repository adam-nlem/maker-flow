<?php

namespace App\Exception\Agency;

use Symfony\Component\HttpFoundation\Response;

final class MissingAgencyException extends AgencyException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'The current user is not attached to any agency.',
            self::CODE,
            Response::HTTP_FORBIDDEN,
        );
    }
}
