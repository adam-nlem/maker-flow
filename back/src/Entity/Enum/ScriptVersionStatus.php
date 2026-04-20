<?php

namespace App\Entity\Enum;

enum ScriptVersionStatus: string
{
    case Draft = 'draft';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
