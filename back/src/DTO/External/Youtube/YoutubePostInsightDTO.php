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

    /**
     * Maps YouTube Data API statistics field names to insight types.
     * Provides real-time lifetime totals per video.
     */
    private const DATA_API_STATISTICS_MAPPING = [
        'viewCount' => PostInsightType::Views,
        'likeCount' => PostInsightType::Likes,
        'commentCount' => PostInsightType::Comments,
    ];

    /**
     * Maps YouTube Analytics API metric names to insight types.
     * Provides lifetime totals for metrics not available in the Data API.
     */
    private const ANALYTICS_API_METRIC_MAPPING = [
        'shares' => PostInsightType::Shares,
        'estimatedMinutesWatched' => PostInsightType::TotalWatchTime,
        'averageViewDuration' => PostInsightType::AverageWatchTime,
        'dislikes' => PostInsightType::Dislikes,
        'subscribersGained' => PostInsightType::FollowersGained,
        'subscribersLost' => PostInsightType::FollowersLost,
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

    /**
     * Creates a DTO from a YouTube Data API statistics field.
     */
    public static function fromDataApiStatistic(string $statisticName, float $value): self
    {
        $type = self::DATA_API_STATISTICS_MAPPING[$statisticName] ?? null;

        return new self(type: $type, value: $value);
    }

    /**
     * Creates a DTO from a YouTube Analytics API metric.
     * Handles unit conversions where needed.
     */
    public static function fromAnalyticsMetric(string $metricName, float $rawValue): self
    {
        $type = self::ANALYTICS_API_METRIC_MAPPING[$metricName] ?? null;

        $value = match ($metricName) {
            'estimatedMinutesWatched' => $rawValue * 60, // minutes → seconds
            default => $rawValue,
        };

        return new self(type: $type, value: $value);
    }

    /**
     * @param YoutubePostInsightDTO[] $postInsightDTOs
     */
    public static function buildTotalInteractions(array $postInsightDTOs): self
    {
        $values = [];

        foreach ($postInsightDTOs as $dto) {
            if ($dto->getType() !== null) {
                $values[$dto->getType()->value] = $dto->getValue();
            }
        }

        $totalInteractions = ($values[PostInsightType::Likes->value] ?? 0.0)
            + ($values[PostInsightType::Dislikes->value] ?? 0.0)
            + ($values[PostInsightType::Comments->value] ?? 0.0)
            + ($values[PostInsightType::Shares->value] ?? 0.0);

        return new self(
            type: PostInsightType::TotalInteractions,
            value: $totalInteractions,
        );
    }

    /**
     * @return string[]
     */
    public static function getAnalyticsMetrics(): array
    {
        return array_keys(self::ANALYTICS_API_METRIC_MAPPING);
    }
}
