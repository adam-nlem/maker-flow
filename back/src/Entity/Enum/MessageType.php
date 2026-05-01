<?php

namespace App\Entity\Enum;

enum MessageType: string
{
    case System = 'system';
    case User = 'user';
    case Ai = 'ai';
}
