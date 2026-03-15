<?php

namespace App\Entity\Enum;

enum OtpType: string
{
    case Login = 'login';
    case EmailVerification = 'email_verification';
    case PrelaunchVerification = 'prelaunch_verification';
}
