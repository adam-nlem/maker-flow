<?php

namespace App\Entity\Enum;

enum SubscriptionStatus: string
{
    case Active = 'active';
    case PastDue = 'past_due';
    case Canceled = 'canceled';
    case Incomplete = 'incomplete';
    case Trialing = 'trialing';
    case Unpaid = 'unpaid';
}
