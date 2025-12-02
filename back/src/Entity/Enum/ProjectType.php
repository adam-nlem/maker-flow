<?php

namespace App\Entity\Enum;

enum ProjectType: string
{
    case Saas = 'saas';
    case ContentCreation = 'content_creation';
}
