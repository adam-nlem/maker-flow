<?php

namespace App\DTO\External\Instagram;

use App\DTO\External\AbstractPostInsightDTO;
use App\Entity\Enum\PostInsightType;

class InstagramPostInsightDTO extends AbstractPostInsightDTO
{
    private const METRIC_MAPPING = [
        'reach' => PostInsightType::Reach,
        'saved' => PostInsightType::Saves,
        'views' => PostInsightType::Views,
        'likes' => PostInsightType::Likes,
        'comments' => PostInsightType::Comments,
        'shares' => PostInsightType::Shares,
        'ig_reels_avg_watch_time' => PostInsightType::AverageWatchTime,
        'ig_reels_video_view_total_time' => PostInsightType::TotalWatchTime,
    ];

    private const INTERACTION_TYPES = [
        PostInsightType::Likes,
        PostInsightType::Comments,
        PostInsightType::Shares,
        PostInsightType::Saves,
    ];

    /**
     * @return InstagramPostInsightDTO[]
     */
    public static function fromInsightsData(array $insightsData): array
    {
        $dtos = [];

        foreach ($insightsData as $insightData) {
            $dtos[] = self::fromArray($insightData);
        }

        $dtos[] = self::buildTotalInteractions($dtos);

        return $dtos;
    }

    public static function fromArray(array $data): self
    {
        $metricName = $data['name'] ?? null;
        $type = self::METRIC_MAPPING[$metricName] ?? null;
        $value = (float) ($data['values'][0]['value'] ?? 0);

        return new self(
            type: $type,
            value: $value,
        );
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }

    protected static function getInteractionTypes(): array
    {
        return self::INTERACTION_TYPES;
    }
}
