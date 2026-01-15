<?php

namespace App\Entity\Enum;

enum OAuthCallbackStatus: string
{
    case Success = 'success';
    case Error = 'error';
}
