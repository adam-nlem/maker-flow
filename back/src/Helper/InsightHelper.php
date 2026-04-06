<?php

namespace App\Helper;

use App\DTO\AggregatedInsightDTO;
use App\Entity\Enum\PostInsightType;

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

    /**
     * @param array<array{postGroupId: int, type: PostInsightType|string, totalValue: string}> $rows
     * @return array<int, AggregatedInsightDTO[]>
     */
    public static function buildAggregatedInsightsMapByGroupId(array $rows): array
    {
        $map = [];

        foreach ($rows as $row) {
            $type = $row['type'] instanceof PostInsightType ? $row['type']->value : $row['type'];
            $map[$row['postGroupId']][] = new AggregatedInsightDTO($type, (float) $row['totalValue']);
        }

        return $map;
    }

    /**
     * @param AggregatedInsightDTO[] $insights
     */
    public static function calculateEngagementByViews(array $insights): ?float
    {
        $views = self::findAggregatedValue($insights, PostInsightType::Views);
        $totalInteractions = self::findAggregatedValue($insights, PostInsightType::TotalInteractions);

        return self::calculateEngagement($totalInteractions, $views);
    }

    /**
     * @param AggregatedInsightDTO[] $insights
     */
    public static function findAggregatedValue(array $insights, PostInsightType $type): ?float
    {
        foreach ($insights as $insight) {
            if ($insight->getType() === $type->value) {
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
