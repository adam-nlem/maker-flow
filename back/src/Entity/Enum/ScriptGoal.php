<?php

namespace App\Entity\Enum;

enum ScriptGoal: string
{
    case Educate = 'educate';
    case Entertain = 'entertain';
    case Inspire = 'inspire';
    case SellPromote = 'sell_promote';
    case GrowAudience = 'grow_audience';
    case StartConversation = 'start_conversation';
}
