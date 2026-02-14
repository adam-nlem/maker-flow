<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;

class YoutubePostInsightDTO
{
    private const METRIC_MAPPING = [
        'viewCount' => SocialAnalyticsPostInsightType::Views,
        'likeCount' => SocialAnalyticsPostInsightType::Likes,
        'commentCount' => SocialAnalyticsPostInsightType::Comments,
        'shares' => SocialAnalyticsPostInsightType::Shares,
        'averageViewDuration' => SocialAnalyticsPostInsightType::AverageWatchTime,
        'estimatedMinutesWatched' => SocialAnalyticsPostInsightType::TotalWatchTime,
    ];

    public function __construct(
        private readonly ?SocialAnalyticsPostInsightType $type,
        private readonly int $value,
    ) {}

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

    /**
     * @return string[]
     */
    public static function getDataApiMetrics(): array
    {
        return ['viewCount', 'likeCount', 'commentCount'];
    }

    /**
     * @return string[]
     */
    public static function getAnalyticsMetrics(): array
    {
        return ['shares', 'averageViewDuration', 'estimatedMinutesWatched'];
    }
}
