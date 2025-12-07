<?php

namespace App\Service\Module\Exception;

use App\Serivce\ServiceException;

abstract class ModuleServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 100200;
    }
}
