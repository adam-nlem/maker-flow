<?php

namespace App\Entity\Enum;

enum Tone: string
{
    case Calm = 'calm';
    case Dynamic = 'dynamic';
    case Dramatic = 'dramatic';
    case Neutral = 'neutral';
    case CasualFriendly = 'casual_friendly';
    case EducationalAuthoritative = 'educational_authoritative';
    case HypeEnergetic = 'hype_energetic';
    case FunnySarcastic = 'funny_sarcastic';
    case StorytellingEmotional = 'storytelling_emotional';
}
