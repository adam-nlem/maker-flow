<?php

namespace App\Entity\Enum;

enum ScriptFormat: string
{
    case FullScript = 'full_script';
    case Outline = 'outline';
    case Hybrid = 'hybrid';
}
