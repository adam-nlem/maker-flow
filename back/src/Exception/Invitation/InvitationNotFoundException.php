<?php

namespace App\Exception\Invitation;

use Symfony\Component\HttpFoundation\Response;

final class InvitationNotFoundException extends InvitationException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'The invitation could not be found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
