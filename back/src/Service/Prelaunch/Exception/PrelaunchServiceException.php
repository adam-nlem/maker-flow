<?php

namespace App\Service\Prelaunch\Exception;

use App\Service\ServiceException;

abstract class PrelaunchServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 160200;
    }
}
