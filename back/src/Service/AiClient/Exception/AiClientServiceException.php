<?php

namespace App\Service\AiClient\Exception;

use App\Service\ServiceException;

abstract class AiClientServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 110300;
    }
}
