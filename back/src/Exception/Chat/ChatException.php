<?php

namespace App\Exception\Chat;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ChatException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Chat;
    }
}
