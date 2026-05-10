<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvitationAlreadyUsedException extends InvitationException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'The invitation has already been used.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
