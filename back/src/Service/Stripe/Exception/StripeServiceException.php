<?php

namespace App\Service\Stripe\Exception;

use App\Service\ServiceException;

abstract class StripeServiceException extends ServiceException
{
    protected function getServiceCode(): int
    {
        return 130200;
    }
}
