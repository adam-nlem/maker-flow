<?php

namespace App\Exception\Integration;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class IntegrationException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Integration;
    }
}
