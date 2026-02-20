<?php

namespace App\DTO\External\Instagram;

use App\Entity\Enum\IntegrationInsightType;

class InstagramIntegrationInsightDTO
{
    private const INSTAGRAM_METRIC_MAPPING = [
        'reach' => IntegrationInsightType::Reach,
        'views' => IntegrationInsightType::Views,
        'follower_count' => IntegrationInsightType::GainedFollowers,
        'followers_count' => IntegrationInsightType::TotalFollowers,
        'profile_links_taps' => IntegrationInsightType::ProfileLinksTaps,
        'comments' => IntegrationInsightType::Comments,
        'shares' => IntegrationInsightType::Shares,
        'saves' => IntegrationInsightType::Saves,
        'likes' => IntegrationInsightType::Likes,
        'follower_demographics' => IntegrationInsightType::EngagedAudienceAge,
    ];

    public function __construct(
        private readonly string $name,
        private readonly string $period,
        private readonly float $value,
    ) {
    }

    public static function fromArray(array $data): self
    {
        $value = 0.0;

        if (isset($data['total_value']['value'])) {
            $value = (float) $data['total_value']['value'];
        }

        return new self(
            name: $data['name'],
            period: $data['period'],
            value: $value,
        );
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getPeriod(): string
    {
        return $this->period;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public static function getMetricNames(array $except = []): array
    {
        $metricNames = array_keys(self::INSTAGRAM_METRIC_MAPPING);

        if (empty($except)) {
            return $metricNames;
        }

        return array_values(array_diff($metricNames, $except));
    }

    public static function getMetricMapping(): array
    {
        return self::INSTAGRAM_METRIC_MAPPING;
    }
}
