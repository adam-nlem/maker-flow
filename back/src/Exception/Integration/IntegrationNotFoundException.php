<?php

namespace App\Exception\Integration;

use Symfony\Component\HttpFoundation\Response;

final class IntegrationNotFoundException extends IntegrationException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Integration not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
