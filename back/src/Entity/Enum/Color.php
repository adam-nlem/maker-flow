<?php

namespace App\Entity\Enum;

// These colors are all the colors available for the user to pick from 
// to customize todo tags etc.

enum Color: string
{
    case Red = 'red';
    case Blue = 'blue';
    case Purple = 'purple';
    case Yellow = 'yellow';
    case Green = 'green';
}
