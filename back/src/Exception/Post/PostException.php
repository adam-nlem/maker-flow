<?php

namespace App\Exception\Post;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class PostException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::Post;
    }
}
