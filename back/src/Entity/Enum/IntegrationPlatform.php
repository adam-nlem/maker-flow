<?php

namespace App\Entity\Enum;

enum IntegrationPlatform: string
{
    case Github = 'github';
    case Youtube = 'youtube';
    case Instagram = 'instagram';
}
