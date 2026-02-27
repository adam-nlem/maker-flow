<?php

namespace App\Entity\Enum;

enum CallToActionType: string
{
    case Subscribe = 'subscribe';
    case Like = 'like';
    case Comment = 'comment';
    case Share = 'share';
    case Link = 'link';
    case Custom = 'custom';
}
