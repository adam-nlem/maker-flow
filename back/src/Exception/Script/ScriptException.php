<?php

namespace App\Exception\Script;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ScriptException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Script;
    }
}
