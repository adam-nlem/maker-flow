<?php

namespace App\Entity\Enum;

enum YoutubeSubscribedStatus: string
{
    case Subscribed = 'SUBSCRIBED';
    case NotSubscribed = 'NOT_SUBSCRIBED';
}
