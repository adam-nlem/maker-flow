<?php

namespace App\DTO\External\Youtube;

use App\Entity\Enum\IntegrationInsightType;

class YoutubeIntegrationInsightDTO
{
    private const YOUTUBE_METRIC_MAPPING = [
        'views' => IntegrationInsightType::Views,
        'likes' => IntegrationInsightType::Likes,
        'dislikes' => IntegrationInsightType::Dislikes,
        'comments' => IntegrationInsightType::Comments,
        'shares' => IntegrationInsightType::Shares,
        'subscribersGained' => IntegrationInsightType::GainedFollowers,
        'subscriberCount' => IntegrationInsightType::TotalFollowers,
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
