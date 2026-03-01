<?php

namespace App\Service\Integration\Exception;

use App\Service\ServiceException;

abstract class IntegrationServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 100200;
    }
}
