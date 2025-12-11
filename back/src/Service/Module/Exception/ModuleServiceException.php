<?php

namespace App\Service\Module\Exception;

use App\Service\ServiceException;

abstract class ModuleServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 100200;
    }
}
