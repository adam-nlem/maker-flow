<?php

namespace App\Service\Otp\Exception;

use App\Service\ServiceException;

abstract class OtpServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 150200;
    }
}
