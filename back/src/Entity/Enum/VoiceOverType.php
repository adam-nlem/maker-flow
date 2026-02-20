<?php

namespace App\Entity\Enum;

enum VoiceOverType: string
{
    case Calm = 'calm';
    case Dynamic = 'dynamic';
    case Dramatic = 'dramatic';
    case Neutral = 'neutral';
}
