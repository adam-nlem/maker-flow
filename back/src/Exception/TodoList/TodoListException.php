<?php

namespace App\Exception\TodoList;

use App\Exception\AppException;
use App\Exception\DomainCode;

abstract class TodoListException extends AppException
{
    protected function getDomainCode(): DomainCode
    {
        return DomainCode::TodoList;
    }
}
