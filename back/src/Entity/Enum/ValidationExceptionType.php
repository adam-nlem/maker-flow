<?php

namespace App\Entity\Enum;

enum ValidationExceptionType: string
{
    case AlreadyUsedValue = 'already_used_value';
}
