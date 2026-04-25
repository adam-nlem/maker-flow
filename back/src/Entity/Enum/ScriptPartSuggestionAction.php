<?php

namespace App\Entity\Enum;

enum ScriptPartSuggestionAction: string
{
    case Rewrite = 'rewrite';
    case Insert = 'insert';
    case Delete = 'delete';
    case Reorder = 'reorder';
}
