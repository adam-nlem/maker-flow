<?php

namespace App\Entity\Enum;

enum ScriptPartType: string
{
    case Chapter = 'chapter';
    case VoiceOver = 'voice_over';
    case Dialogue = 'dialogue';
    case Shot = 'shot';
}
