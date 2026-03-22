<?php

namespace App\Exception\Validation;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ValidationException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Validation;
    }
}
