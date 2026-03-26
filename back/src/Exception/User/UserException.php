<?php

namespace App\Exception\User;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class UserException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::User;
    }
}
