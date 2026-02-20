<?php

namespace App\DTO\External\Youtube;

use App\Entity\Enum\InsightValueFormat;
use App\Entity\Enum\PostInsightType;

class YoutubePostInsightDTO
{
    /**
     * Maps Reporting API CSV column names to insight types.
     */
    private const REPORTING_METRIC_MAPPING = [
        'views' => PostInsightType::Views,
        'likes' => PostInsightType::Likes,
        'dislikes' => PostInsightType::Dislikes,
        'comments' => PostInsightType::Comments,
        'shares' => PostInsightType::Shares,
        'average_view_duration_seconds' => PostInsightType::AverageWatchTime,
        'watch_time_minutes' => PostInsightType::TotalWatchTime,
        'subscribers_gained' => PostInsightType::FollowersGained,
        'subscribers_lost' => PostInsightType::FollowersLost,
        'video_thumbnail_impressions' => PostInsightType::ThumbnailImpressions,
        'video_thumbnail_impressions_ctr' => PostInsightType::ThumbnailImpressionsClickRate,
    ];

    public function __construct(
        private readonly ?PostInsightType $type,
        private readonly float $value,
    ) {}

    public function getType(): ?PostInsightType
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
     * @return array<string, PostInsightType>
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
