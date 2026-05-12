<?php

namespace App\Exception\Onboarding;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class OnboardingException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Onboarding;
    }
}
