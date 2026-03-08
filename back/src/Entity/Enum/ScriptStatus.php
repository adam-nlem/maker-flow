<?php

namespace App\Entity\Enum;

enum ScriptStatus: string
{
    case Idea = 'idea';
    case Scripting = 'scripting';
    case Shooting = 'shooting';
    case Editing = 'editing';
    case Scheduled = 'scheduled';
    case Published = 'published';
}
