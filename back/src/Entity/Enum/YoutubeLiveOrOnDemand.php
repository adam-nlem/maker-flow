<?php

namespace App\Entity\Enum;

enum YoutubeLiveOrOnDemand: string
{
    case Live = 'LIVE';
    case OnDemand = 'ON_DEMAND';
}
