<?php

namespace App\Helper;

class InsightHelper
{
    /**
     * @param array $insights Array of insight entities with getType() and getValue() methods
     */
    public static function getInsightValueByType(array $insights, \BackedEnum $type): ?float
    {
        foreach ($insights as $insight) {
            if ($insight->getType() === $type) {
                return $insight->getValue();
            }
        }

        return null;
    }

    public static function calculateEngagement(?float $interactions, ?float $divisor): ?float
    {
        if ($interactions === null || $divisor === null || $divisor == 0) {
            return null;
        }

        return round(($interactions / $divisor) * 100, 2);
    }
}
