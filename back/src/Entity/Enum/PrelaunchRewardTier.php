<?php

namespace App\Entity\Enum;

enum PrelaunchRewardTier: string
{
    case EarlyBetaAccess = 'early_beta_access';
    case DevDiscordAccess = 'dev_discord_access';
    case LifetimeDiscount = 'lifetime_discount';

    public function getThreshold(): int
    {
        return match ($this) {
            self::EarlyBetaAccess => 5,
            self::DevDiscordAccess => 10,
            self::LifetimeDiscount => 25,
        };
    }

    public function getSegmentName(): string
    {
        return match ($this) {
            self::EarlyBetaAccess => 'Prelaunch - Early Beta Access',
            self::DevDiscordAccess => 'Prelaunch - Dev Discord Access',
            self::LifetimeDiscount => 'Prelaunch - Lifetime Discount',
        };
    }
}
