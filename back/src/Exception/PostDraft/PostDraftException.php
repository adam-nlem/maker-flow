<?php

namespace App\Exception\PostDraft;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class PostDraftException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::PostDraft;
    }
}
