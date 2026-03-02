<?php

namespace App\Service\Credit\Exception;

use App\Service\ServiceException;

abstract class CreditServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 120200;
    }
}
