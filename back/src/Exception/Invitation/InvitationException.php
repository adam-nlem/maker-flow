<?php

namespace App\Exception\Invitation;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class InvitationException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Invitation;
    }
}
