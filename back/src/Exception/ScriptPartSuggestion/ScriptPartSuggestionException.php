<?php

namespace App\Exception\ScriptPartSuggestion;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ScriptPartSuggestionException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::ScriptPartSuggestion;
    }
}
