<?php

namespace App\Module\TodoList\Entity\Enum;

enum TodoListPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
