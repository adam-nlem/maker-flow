<?php

namespace App\Entity\Enum;

enum InsightValueFormat: string
{
    case Integer = 'integer';
    case Float = 'float';
    case Percentage = 'percentage';
    case Seconds = 'seconds';
}
