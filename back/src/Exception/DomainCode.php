<?php

namespace App\Exception;

enum DomainCode: int
{
    case Integration = 10;
    case AiClient = 11;
    case Credit = 12;
    case Stripe = 13;
    case Mailing = 14;
    case Otp = 15;
    case Prelaunch = 16;
    case Project = 17;
    case Script = 18;
    case TodoList = 19;
    case Post = 20;
    case User = 21;
    case Validation = 22;
    case Auth = 23;
}
