<?php

namespace App\Module\SocialAnalytics\Helper;

use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost\SocialAnalyticsPostInsightWithEvolutionDTO;

class InsightEvolutionHelper
{
    public static function calculateEvolutionPercentage(float $currentValue, ?float $previousValue): ?string
    {
        if ($previousValue === null || $previousValue == 0) {
            return null;
        }

        $percentage = round((($currentValue - $previousValue) / $previousValue) * 100, 1);
        $sign = $percentage >= 0 ? '+' : '';

        return $sign . $percentage . '%';
    }

    /**
     * @param array $previousInsights Array of insight entities with getType() and getValue() methods
     * @return array<string, float> Map of type value to previous value
     */
    public static function buildPreviousValuesByType(array $previousInsights): array
    {
        $previousByType = [];
        foreach ($previousInsights as $insight) {
            $previousByType[$insight->getType()->value] = $insight->getValue();
        }

        return $previousByType;
    }

    /**
     * @param array $currentInsights  Array of post insight entities
     * @param array $previousInsights Array of post insight entities
     * @param string[] $typeOrder     Ordered type values for sorting
     * @return SocialAnalyticsPostInsightWithEvolutionDTO[]
     */
    public static function buildPostInsightsWithEvolution(
        array $currentInsights,
        array $previousInsights,
        array $typeOrder,
    ): array {
        $previousByType = self::buildPreviousValuesByType($previousInsights);

        usort($currentInsights, function ($a, $b) use ($typeOrder) {
            $posA = array_search($a->getType()->value, $typeOrder);
            $posB = array_search($b->getType()->value, $typeOrder);
            return $posA - $posB;
        });

        $insightsWithEvolution = [];
        foreach ($currentInsights as $insight) {
            $previousValue = $previousByType[$insight->getType()->value] ?? null;

            $evolutionPercentage = self::calculateEvolutionPercentage($insight->getValue(), $previousValue);

            $insightsWithEvolution[] = new SocialAnalyticsPostInsightWithEvolutionDTO(
                insight: $insight,
                evolutionPercentage: $evolutionPercentage,
            );
        }

        return $insightsWithEvolution;
    }
}
