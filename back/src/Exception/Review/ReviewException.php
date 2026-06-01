<?php

namespace App\Exception\Review;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class ReviewException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Review;
    }
}
