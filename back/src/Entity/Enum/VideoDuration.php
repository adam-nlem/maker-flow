<?php

namespace App\Entity\Enum;

enum VideoDuration: string
{
    case ThirtySeconds = '30_seconds';
    case OneMinute = '1_minute';
    case OneMinuteThirty = '1_minute_30';
    case TwoMinutes = '2_minutes';
    case FiveToTenMinutes = '5_to_10_minutes';
    case TenToTwentyMinutes = '10_to_20_minutes';
    case TwentyPlusMinutes = '20_plus_minutes';
}
