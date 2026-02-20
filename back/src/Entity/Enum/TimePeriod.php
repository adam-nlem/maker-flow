<?php

namespace App\Entity\Enum;

enum TimePeriod: string
{
    case Last7Days = 'last_7_days';
    case Last30Days = 'last_30_days';
    case Last90Days = 'last_90_days';
    case LastYear = 'last_year';

    public function toDateTimeImmutable(): \DateTimeImmutable
    {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));

        return match ($this) {
            self::Last7Days => $now->modify('-7 days'),
            self::Last30Days => $now->modify('-30 days'),
            self::Last90Days => $now->modify('-90 days'),
            self::LastYear => $now->modify('-1 year'),
        };
    }

    public function getDaysCount(): int
    {
        return match ($this) {
            self::Last7Days => 7,
            self::Last30Days => 30,
            self::Last90Days => 90,
            self::LastYear => 365,
        };
    }
}
