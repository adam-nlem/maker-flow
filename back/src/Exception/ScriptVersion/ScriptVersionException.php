<?php

namespace App\Exception\ScriptVersion;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ScriptVersionException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::ScriptVersion;
    }
}
