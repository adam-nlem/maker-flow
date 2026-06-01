<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvitationExpiredException extends InvitationException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'The invitation has expired.',
            self::CODE,
            Response::HTTP_UNPROCESSABLE_ENTITY,
        );
    }
}
