<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvalidInvitationRoleException extends InvitationException
{
    public const CODE = 5;

    public function __construct()
    {
        parent::__construct(
            'The role provided for the collaborator invitation is invalid.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
