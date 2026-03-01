<?php

namespace App\Service\GeminiClient\Exception;

use App\Service\ServiceException;

abstract class GeminiClientServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 110200;
    }
}
