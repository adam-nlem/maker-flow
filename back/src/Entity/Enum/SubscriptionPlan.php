<?php

namespace App\Entity\Enum;

enum SubscriptionPlan: string
{
    case Starter = 'starter';
    case Creator = 'creator';
    case Agency = 'agency';

    public function getMaxProjects(): ?int
    {
        return match ($this) {
            self::Starter => 1,
            self::Creator => 1,
            self::Agency  => null,
        };
    }

    public function getMaxScriptsPerProject(): ?int
    {
        return match ($this) {
            self::Starter => null,
            self::Creator => null,
            self::Agency  => null,
        };
    }
}
