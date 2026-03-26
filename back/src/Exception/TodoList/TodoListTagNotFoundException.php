<?php

namespace App\Exception\TodoList;

use Symfony\Component\HttpFoundation\Response;

final class TodoListTagNotFoundException extends TodoListException
{
    public const CODE = 3;

    public function __construct()
    {
        parent::__construct(
            'Todo list tag not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
