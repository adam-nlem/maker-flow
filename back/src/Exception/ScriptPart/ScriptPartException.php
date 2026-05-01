<?php

namespace App\Exception\ScriptPart;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ScriptPartException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::ScriptPart;
    }
}
