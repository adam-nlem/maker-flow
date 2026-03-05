<?php

namespace App\Entity\Enum;

enum SubscriptionPlan: string
{
    case Free = 'free';
    case Starter = 'starter';
    case Creator = 'creator';
    case Agency = 'agency';

    public function getMaxProjects(): ?int
    {
        return match ($this) {
            self::Free    => 1,
            self::Starter => 1,
            self::Creator => 1,
            self::Agency  => null,
        };
    }
}
