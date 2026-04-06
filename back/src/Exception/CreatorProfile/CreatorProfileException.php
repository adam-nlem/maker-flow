<?php

namespace App\Exception\CreatorProfile;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class CreatorProfileException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::CreatorProfile;
    }
}
