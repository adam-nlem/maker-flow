<?php

namespace App\Module\SocialAnalytics\DTO\External\Instagram;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;

class InstagramPostInsightDTO
{
    private const METRIC_MAPPING = [
        'reach' => SocialAnalyticsPostInsightType::Reach,
        'total_interactions' => SocialAnalyticsPostInsightType::TotalInteractions,
        'saved' => SocialAnalyticsPostInsightType::Saved,
        'views' => SocialAnalyticsPostInsightType::Views,
        'likes' => SocialAnalyticsPostInsightType::Likes,
        'comments' => SocialAnalyticsPostInsightType::Comments,
        'shares' => SocialAnalyticsPostInsightType::Shares,
        'ig_reels_avg_watch_time' => SocialAnalyticsPostInsightType::AverageWatchTime,
        'ig_reels_video_view_total_time' => SocialAnalyticsPostInsightType::TotalWatchTime,

    ];

    public function __construct(
        private readonly ?SocialAnalyticsPostInsightType $type,
        private readonly int $value,
    ) {}

    public static function fromArray(array $data): self
    {
        $metricName = $data['name'] ?? null;
        $type = self::METRIC_MAPPING[$metricName] ?? null;
        $value = $data['values'][0]['value'] ?? 0;

        return new self(
            type: $type,
            value: $value,
        );
    }

    public function getType(): ?SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }
}
