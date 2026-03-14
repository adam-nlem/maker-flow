<?php

namespace App\Entity\Enum;

enum StripeProductType: string
{
    case Subscription = 'subscription';
    case Refill = 'refill';
}
