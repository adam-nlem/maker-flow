<?php

namespace App\Entity\Enum;

enum ScriptStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
}
