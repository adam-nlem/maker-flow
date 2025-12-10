<?php

namespace App\Entity\Enum;

// These colors are all the colors available for the user to pick from 
// to customize todo categories etc.

enum Color: string
{
    case Red = 'red';
    case Blue = 'blued';
    case Purple = 'purple';
    case Yellow = 'yellow';
    case Green = 'green';
}
