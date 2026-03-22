<?php

namespace App\Exception\Project;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ProjectException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Project;
    }
}
