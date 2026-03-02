<?php

namespace App\Entity\Enum;

enum SubscriptionPlan: string
{
    case Free = 'free';
    case Starter = 'starter';
    case Creator = 'creator';
    case Agency = 'agency';
}
