<?php

namespace App\Entity\Enum;

enum ScriptStatus: string
{
    case Pending = 'pending';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Idea = 'idea';
    case Scripting = 'scripting';
    case Shooting = 'shooting';
    case Editing = 'editing';
    case Scheduled = 'scheduled';
    case Published = 'published';
}
