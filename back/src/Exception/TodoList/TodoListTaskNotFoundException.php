<?php

namespace App\Exception\TodoList;

use Symfony\Component\HttpFoundation\Response;

final class TodoListTaskNotFoundException extends TodoListException
{
    public const CODE = 2;

    public function __construct()
    {
        parent::__construct(
            'Todo list task not found.',
            self::CODE,
            Response::HTTP_NOT_FOUND,
        );
    }
}
