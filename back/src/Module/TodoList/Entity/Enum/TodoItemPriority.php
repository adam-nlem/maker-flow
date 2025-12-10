<?php

namespace App\Module\TodoList\Entity\Enum;

enum TodoItemPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
