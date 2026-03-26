<?php

namespace App\Exception\TodoList;

use Symfony\Component\HttpFoundation\Response;

final class TodoListTagTitleConflictException extends TodoListException
{
    public const CODE = 4;

    public function __construct()
    {
        parent::__construct(
            'You already have a todo list tag with this title.',
            self::CODE,
            Response::HTTP_CONFLICT,
        );
    }
}
