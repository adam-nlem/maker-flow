<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\InsightValueFormat;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;

class YoutubePostInsightDTO
{
    /**
     * Maps Reporting API CSV column names to insight types.
     */
    private const REPORTING_METRIC_MAPPING = [
        'views' => SocialAnalyticsPostInsightType::Views,
        'likes' => SocialAnalyticsPostInsightType::Likes,
        'dislikes' => SocialAnalyticsPostInsightType::Dislikes,
        'comments' => SocialAnalyticsPostInsightType::Comments,
        'shares' => SocialAnalyticsPostInsightType::Shares,
        'average_view_duration_seconds' => SocialAnalyticsPostInsightType::AverageWatchTime,
        'watch_time_minutes' => SocialAnalyticsPostInsightType::TotalWatchTime,
        'subscribers_gained' => SocialAnalyticsPostInsightType::FollowersGained,
        'subscribers_lost' => SocialAnalyticsPostInsightType::FollowersLost,
        'video_thumbnail_impressions' => SocialAnalyticsPostInsightType::ThumbnailImpressions,
        'video_thumbnail_impressions_ctr' => SocialAnalyticsPostInsightType::ThumbnailImpressionsClickRate,
    ];

    public function __construct(
        private readonly ?SocialAnalyticsPostInsightType $type,
        private readonly float $value,
    ) {}

    public function getType(): ?SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getValueFormat(): InsightValueFormat
    {
        return $this->type?->getValueFormat() ?? InsightValueFormat::Integer;
    }

    /**
     * @return array<string, SocialAnalyticsPostInsightType>
     */
    public static function getReportingMetricMapping(): array
    {
        return self::REPORTING_METRIC_MAPPING;
    }

    /**
     * Creates a DTO from a Reporting API CSV metric.
     * Handles unit conversions where needed.
     */
    public static function fromReportingMetric(string $metricName, float $rawValue): self
    {
        $type = self::REPORTING_METRIC_MAPPING[$metricName] ?? null;

        $value = match ($metricName) {
            'watch_time_minutes' => $rawValue * 60, // minutes → seconds
            default => $rawValue,
        };

        return new self(type: $type, value: $value);
    }
}
