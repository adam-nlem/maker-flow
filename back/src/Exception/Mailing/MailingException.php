<?php

namespace App\Exception\Mailing;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class MailingException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Mailing;
    }
}
