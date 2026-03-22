<?php

namespace App\Exception\Otp;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class OtpException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Otp;
    }
}
