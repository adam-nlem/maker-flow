<?php

namespace App\DTO\External\Instagram;

use App\Entity\Enum\PostInsightType;

class InstagramPostInsightDTO
{
    private const METRIC_MAPPING = [
        'reach' => PostInsightType::Reach,
        'total_interactions' => PostInsightType::TotalInteractions,
        'saved' => PostInsightType::Saved,
        'views' => PostInsightType::Views,
        'likes' => PostInsightType::Likes,
        'comments' => PostInsightType::Comments,
        'shares' => PostInsightType::Shares,
        'ig_reels_avg_watch_time' => PostInsightType::AverageWatchTime,
        'ig_reels_video_view_total_time' => PostInsightType::TotalWatchTime,

    ];

    public function __construct(
        private readonly ?PostInsightType $type,
        private readonly float $value,
    ) {}

    public static function fromArray(array $data): self
    {
        $metricName = $data['name'] ?? null;
        $type = self::METRIC_MAPPING[$metricName] ?? null;
        $value = (float) ($data['values'][0]['value'] ?? 0);

        return new self(
            type: $type,
            value: $value,
        );
    }

    public function getType(): ?PostInsightType
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }
}
