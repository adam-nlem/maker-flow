<?php

namespace App\Exception\AgencyCollaborator;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class AgencyCollaboratorException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::AgencyCollaborator;
    }
}
