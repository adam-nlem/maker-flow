<?php

namespace App\Exception\AgencyCollaborator;

use Symfony\Component\HttpFoundation\Response;

final class AgencyCollaboratorNotFoundException extends AgencyCollaboratorException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'No such collaborator in this agency.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
