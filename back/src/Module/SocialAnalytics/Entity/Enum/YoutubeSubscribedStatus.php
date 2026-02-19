<?php

namespace App\Module\SocialAnalytics\Entity\Enum;

enum YoutubeSubscribedStatus: string
{
    case Subscribed = 'SUBSCRIBED';
    case NotSubscribed = 'NOT_SUBSCRIBED';
}
