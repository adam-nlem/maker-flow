<?php

namespace App\Entity\Enum;

enum ScriptPartType: string
{
    case Chapter = 'chapter';
    case VoiceOver = 'voice_over';
    case Dialogue = 'dialogue';
    case Shot = 'shot';
    case Text = 'text';
    case CallToAction = 'call_to_action';
    case RetentionCue = 'retention_cue';
    case Hook = 'hook';
}
