<?php

namespace App\Module\SocialAnalytics\Helper;

class InsightEvolutionHelper
{
    public static function calculateEvolutionPercentage(int $currentValue, ?int $previousValue): ?string
    {
        if ($previousValue === null || $previousValue === 0) {
            return null;
        }

        $percentage = round((($currentValue - $previousValue) / $previousValue) * 100, 1);
        $sign = $percentage >= 0 ? '+' : '';
        
        return $sign . $percentage . '%';
    }

    /**
     * @param array $previousInsights Array of insight entities with getType() and getValue() methods
     * @return array<string, int> Map of type value to previous value
     */
    public static function buildPreviousValuesByType(array $previousInsights): array
    {
        $previousByType = [];
        foreach ($previousInsights as $insight) {
            $previousByType[$insight->getType()->value] = $insight->getValue();
        }

        return $previousByType;
    }
}
