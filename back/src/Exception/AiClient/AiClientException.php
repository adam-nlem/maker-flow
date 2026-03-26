<?php

namespace App\Exception\AiClient;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class AiClientException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::AiClient;
    }
}
