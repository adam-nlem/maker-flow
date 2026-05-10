<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvalidInvitationProjectException extends InvitationException
{
    public const CODE = 7;

    public function __construct()
    {
        parent::__construct(
            'A projectUuid is required to invite a client.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
