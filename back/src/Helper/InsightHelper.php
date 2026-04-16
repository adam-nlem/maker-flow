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

    private const AGGREGATED_INSIGHT_ORDER = [
        PostInsightType::Views,
        PostInsightType::TotalInteractions,
        PostInsightType::AverageWatchTime,
        PostInsightType::TotalWatchTime,
        PostInsightType::Reach,
        PostInsightType::Likes,
        PostInsightType::Comments,
        PostInsightType::Shares,
        PostInsightType::Dislikes,
        PostInsightType::Saves,
        PostInsightType::ThumbnailImpressions,
        PostInsightType::ThumbnailImpressionsClickRate,
        PostInsightType::AudienceWatchRatio,
        PostInsightType::FollowersGained,
        PostInsightType::FollowersLost,
    ];

    /**
     * @param AggregatedInsightDTO[] $insights
     * @return AggregatedInsightDTO[]
     */
    public static function sortAggregatedInsights(array $insights): array
    {
        $typeOrder = array_map(fn(PostInsightType $t) => $t->value, self::AGGREGATED_INSIGHT_ORDER);

        usort($insights, function (AggregatedInsightDTO $a, AggregatedInsightDTO $b) use ($typeOrder) {
            $posA = array_search($a->getType(), $typeOrder);
            $posB = array_search($b->getType(), $typeOrder);
            return $posA - $posB;
        });

        return $insights;
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
