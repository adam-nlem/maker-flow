<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class EmailAlreadyUsedException extends InvitationException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'A user with this email address already exists.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
