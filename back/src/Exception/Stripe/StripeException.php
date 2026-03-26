<?php

namespace App\Exception\Stripe;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class StripeException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Stripe;
    }
}
