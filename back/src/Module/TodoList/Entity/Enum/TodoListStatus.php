<?php

namespace App\Module\TodoList\Entity\Enum;

enum TodoListStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
