<?php

namespace App\Exception\TargetAudience;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class TargetAudienceException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::TargetAudience;
    }
}
