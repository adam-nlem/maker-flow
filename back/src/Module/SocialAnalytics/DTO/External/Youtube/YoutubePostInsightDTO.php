<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;

class YoutubePostInsightDTO
{
    private const METRIC_MAPPING = [
        'views' => SocialAnalyticsPostInsightType::Views,
        'likes' => SocialAnalyticsPostInsightType::Likes,
        'dislikes' => SocialAnalyticsPostInsightType::Dislikes,
        'comments' => SocialAnalyticsPostInsightType::Comments,
        'shares' => SocialAnalyticsPostInsightType::Shares,
        'averageViewDuration' => SocialAnalyticsPostInsightType::AverageWatchTime,
        'estimatedMinutesWatched' => SocialAnalyticsPostInsightType::TotalWatchTime,
        'videoThumbnailImpressions' => SocialAnalyticsPostInsightType::ThumbnailImpressions,
        'videoThumbnailImpressionsClickRate' => SocialAnalyticsPostInsightType::ThumbnailImpressionsClickRate,
        'subscribersGained' => SocialAnalyticsPostInsightType::FollowersGained,
        'subscribersLost' => SocialAnalyticsPostInsightType::FollowersLost,
    ];

    public function __construct(
        private readonly ?SocialAnalyticsPostInsightType $type,
        private readonly int $value,
    ) {
    }

    public function getType(): ?SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    /**
     * @return array<string, SocialAnalyticsPostInsightType>
     */
    public static function getMetricMapping(): array
    {
        return self::METRIC_MAPPING;
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }

    public static function fromAnalyticsMetric(string $metricName, int $rawValue): self
    {
        $type = self::METRIC_MAPPING[$metricName] ?? null;
        $value = $metricName === 'estimatedMinutesWatched' ? $rawValue * 60 : $rawValue;

        return new self(type: $type, value: $value);
    }
}
