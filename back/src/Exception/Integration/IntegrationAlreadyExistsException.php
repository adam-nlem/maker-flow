<?php

namespace App\Exception\Integration;

use Symfony\Component\HttpFoundation\Response;

final class IntegrationAlreadyExistsException extends IntegrationException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'This project already has an integration for this platform.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
