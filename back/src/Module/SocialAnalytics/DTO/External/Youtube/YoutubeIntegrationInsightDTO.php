<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;

class YoutubeIntegrationInsightDTO
{
    private const YOUTUBE_METRIC_MAPPING = [
        'views' => SocialAnalyticsIntegrationInsightType::Views,
        'likes' => SocialAnalyticsIntegrationInsightType::Likes,
        'dislikes' => SocialAnalyticsIntegrationInsightType::Dislikes,
        'comments' => SocialAnalyticsIntegrationInsightType::Comments,
        'shares' => SocialAnalyticsIntegrationInsightType::Shares,
        'subscribersGained' => SocialAnalyticsIntegrationInsightType::GainedFollowers,
        'subscriberCount' => SocialAnalyticsIntegrationInsightType::TotalFollowers,
    ];

    public function __construct(
        private readonly string $name,
        private readonly float $value,
    ) {
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public static function getMetricNames(array $except = []): array
    {
        $metricNames = array_keys(self::YOUTUBE_METRIC_MAPPING);

        if (empty($except)) {
            return $metricNames;
        }

        return array_values(array_diff($metricNames, $except));
    }

    public static function getMetricMapping(): array
    {
        return self::YOUTUBE_METRIC_MAPPING;
    }

    public static function getAnalyticsMetrics(): array
    {
        return ['views', 'likes', 'dislikes', 'comments', 'shares', 'subscribersGained'];
    }
}
