<?php

namespace App\Exception\Auth;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class AuthException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Auth;
    }
}
