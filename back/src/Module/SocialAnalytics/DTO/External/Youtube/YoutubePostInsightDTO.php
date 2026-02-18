<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;

class YoutubePostInsightDTO
{
    private const VIDEO_METRIC_MAPPING = [
        'views' => SocialAnalyticsPostInsightType::Views,
        'likes' => SocialAnalyticsPostInsightType::Likes,
        'dislikes' => SocialAnalyticsPostInsightType::Dislikes,
        'comments' => SocialAnalyticsPostInsightType::Comments,
        'shares' => SocialAnalyticsPostInsightType::Shares,
        'averageViewDuration' => SocialAnalyticsPostInsightType::AverageWatchTime,
        'estimatedMinutesWatched' => SocialAnalyticsPostInsightType::TotalWatchTime,
        'subscribersGained' => SocialAnalyticsPostInsightType::FollowersGained,
        'subscribersLost' => SocialAnalyticsPostInsightType::FollowersLost,
    ];

    private const REACH_METRIC_MAPPING = [
      'videoThumbnailImpressions' => SocialAnalyticsPostInsightType::ThumbnailImpressions,
      'videoThumbnailImpressionsClickRate' => SocialAnalyticsPostInsightType::ThumbnailImpressionsClickRate,
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
        return self::VIDEO_METRIC_MAPPING + self::REACH_METRIC_MAPPING;
    }

    public static function getVideoMetricNames(): array
    {
        return array_keys(self::VIDEO_METRIC_MAPPING);
    }

    public static function getReachMetricNames(): array
    {
        return array_keys(self::REACH_METRIC_MAPPING);
    }

    public static function fromAnalyticsMetric(string $metricName, int $rawValue): self
    {
        $type = self::VIDEO_METRIC_MAPPING[$metricName] ?? null;
        $value = $metricName === 'estimatedMinutesWatched' ? $rawValue * 60 : $rawValue;

        return new self(type: $type, value: $value);
    }
}
