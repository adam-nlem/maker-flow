<?php

namespace App\Entity\Enum;

enum IntegrationStatus: string
{
    case Active = 'active';
    case Revoked = 'revoked';
    case Error = 'error';
}
