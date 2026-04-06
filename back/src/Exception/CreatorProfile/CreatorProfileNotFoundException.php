<?php

namespace App\Exception\CreatorProfile;

use Symfony\Component\HttpFoundation\Response;

final class CreatorProfileNotFoundException extends CreatorProfileException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'Creator profile not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
