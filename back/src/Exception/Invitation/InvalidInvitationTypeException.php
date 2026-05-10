<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvalidInvitationTypeException extends InvitationException
{
    public const CODE = 6;

    public function __construct()
    {
        parent::__construct(
            'The invitation type is missing or invalid.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
