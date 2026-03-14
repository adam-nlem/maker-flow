<?php

namespace App\Entity\Enum;

enum SourceBucket: string
{
    case SubscriptionCredits = 'subscription_credits';
    case RefillCredits = 'refill_credits';
}
