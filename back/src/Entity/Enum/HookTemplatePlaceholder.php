<?php

namespace App\Entity\Enum;

enum HookTemplatePlaceholder: string
{
    case Topic = 'topic';
    case Audience = 'audience';
    case Benefit = 'benefit';
    case Statistic = 'statistic';
    case Problem = 'problem';
    case Product = 'product';
    case Result = 'result';
    case Emotion = 'emotion';
    case Number = 'number';
    case Goal = 'goal';
    case Date = 'date';

}
