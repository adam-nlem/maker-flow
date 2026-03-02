<?php

namespace App\Entity\Enum;

enum SourceBucket: string
{
    case SubscriptionCredits = 'subscription_credits';
    case TopupCredits = 'topup_credits';
}
