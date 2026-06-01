<?php

namespace App\Exception\AgencyCollaborator;

use Symfony\Component\HttpFoundation\Response;

final class EditorCollaboratorLimitReachedException extends AgencyCollaboratorException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Editor collaborator limit reached for this plan.',
            self::CODE,
            Response::HTTP_PAYMENT_REQUIRED,
        );
    }
}
