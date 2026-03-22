<?php

namespace App\Exception\Credit;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class CreditException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Credit;
    }
}
