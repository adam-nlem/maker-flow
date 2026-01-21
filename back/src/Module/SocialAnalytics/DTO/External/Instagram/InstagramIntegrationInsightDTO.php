<?php

namespace App\Module\SocialAnalytics\DTO\External\Instagram;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;

class InstagramIntegrationInsightDTO
{

    private const INSTAGRAM_METRIC_MAPPING = [
        'reach' => SocialAnalyticsIntegrationInsightType::Reach,
        'views' => SocialAnalyticsIntegrationInsightType::Views,
        'follower_count' => SocialAnalyticsIntegrationInsightType::Followers,
        'profile_links_taps' => SocialAnalyticsIntegrationInsightType::ProfileLinksTaps,
        'comments' => SocialAnalyticsIntegrationInsightType::Comments,
        'shares' => SocialAnalyticsIntegrationInsightType::Shares,
        'saves' => SocialAnalyticsIntegrationInsightType::Saves,
        'likes' => SocialAnalyticsIntegrationInsightType::Likes,
    ];

    public function __construct(
        private readonly string $name,
        private readonly string $period,
        private readonly int $value,
    ) {}

    public static function fromArray(array $data): self
    {
        $value = 0;

        if (isset($data['total_value']['value'])) {
            $value = $data['total_value']['value'];
        }

        return new self(
            name: $data['name'],
            period: $data['period'],
            value: $value,
        );
    }

    public static function fromApiResponse(array $response): array
    {
        $insights = [];

        if (isset($response['data']) && is_array($response['data'])) {
            foreach ($response['data'] as $insightData) {
                $insights[] = self::fromArray($insightData);
            }
        }

        return $insights;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getPeriod(): string
    {
        return $this->period;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::INSTAGRAM_METRIC_MAPPING);
    }

    public static function getMetricMapping(): array
    {
        return self::INSTAGRAM_METRIC_MAPPING;
    }
}
