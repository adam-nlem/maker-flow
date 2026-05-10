<?php

namespace App\Exception\Agency;

use Symfony\Component\HttpFoundation\Response;

final class CollaboratorNotFoundException extends AgencyException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'No such collaborator in this agency.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
