<?php

namespace App\Exception\Agency;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class AgencyException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Agency;
    }
}
