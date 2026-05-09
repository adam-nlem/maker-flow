<?php

namespace App\Entity\Enum;

enum UserRole: string
{
    case User = 'ROLE_USER';
    case Admin = 'ROLE_ADMIN';
    case Editor = 'ROLE_EDITOR';
    case Viewer = 'ROLE_VIEWER';
    case Client = 'ROLE_CLIENT';
}
