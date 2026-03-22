<?php

namespace App\Exception\Prelaunch;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class PrelaunchException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Prelaunch;
    }
}
