<?php

namespace App\Entity\Enum;

enum PostDraftCommentStatus: string
{
    case Open = 'open';
    case Resolved = 'resolved';
}
