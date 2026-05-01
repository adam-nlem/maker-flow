<?php

namespace App\Entity\Enum;

enum ScriptPartSuggestionStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
