<?php

namespace App\Exception\HookTemplate;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class HookTemplateException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::HookTemplate;
    }
}
