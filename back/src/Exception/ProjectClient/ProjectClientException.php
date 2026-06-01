<?php

namespace App\Exception\ProjectClient;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ProjectClientException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::ProjectClient;
    }
}
