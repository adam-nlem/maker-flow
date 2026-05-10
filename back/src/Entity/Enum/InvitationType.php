<?php

namespace App\Entity\Enum;

enum InvitationType: string
{
    case Collaborator = 'collaborator';
    case Client = 'client';
}
