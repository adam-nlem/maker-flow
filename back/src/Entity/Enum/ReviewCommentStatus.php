<?php

namespace App\Entity\Enum;

enum ReviewCommentStatus: string
{
    case Open = 'open';
    case Resolved = 'resolved';
}
