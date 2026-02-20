<?php

namespace App\Entity\Enum;

enum TodoListPriority: string
{
    case Low = 'low';
    case Medium = 'medium';
    case High = 'high';
}
