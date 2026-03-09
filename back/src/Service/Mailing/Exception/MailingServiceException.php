<?php

namespace App\Service\Mailing\Exception;

use App\Service\ServiceException;

abstract class MailingServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 140200;
    }
}
