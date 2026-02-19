<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

enum YoutubeLiveOrOnDemand: string
{
    case Live = 'LIVE';
    case OnDemand = 'ON_DEMAND';
}
