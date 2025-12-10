<?php

namespace App\Module\TodoList\Entity\Enum;

enum TodoItemStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
