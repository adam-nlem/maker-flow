<?php

namespace App\Entity\Enum;

enum IntegrationProvider: string
{
    case Github = 'github';
    case Youtube = 'youtube';
}
