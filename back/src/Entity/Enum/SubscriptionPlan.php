<?php

namespace App\Entity\Enum;

enum SubscriptionPlan: string
{
    case Starter = 'starter';
    case Agency = 'agency';
    case AgencyPlus = 'agency+';
}
