<?php

namespace App\DTO\External\Tiktok;

use App\Entity\Enum\IntegrationInsightType;

class TiktokIntegrationInsightDTO
{
    private const TIKTOK_METRIC_MAPPING = [
        'follower_count' => IntegrationInsightType::TotalFollowers,
        'video_count' => IntegrationInsightType::Videos,
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

    public static function getMetricNames(): array
    {
        return array_keys(self::TIKTOK_METRIC_MAPPING);
    }

    public static function getMetricMapping(): array
    {
        return self::TIKTOK_METRIC_MAPPING;
    }
}
