<?php

namespace App\DTO\External\Instagram;

use App\Entity\Enum\PostInsightType;

class InstagramPostInsightDTO
{
    private const METRIC_MAPPING = [
        'reach' => PostInsightType::Reach,
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

    /**
     * @return InstagramPostInsightDTO[]
     */
    public static function fromInsightsData(array $insightsData): array
    {
        $dtos = [];

        foreach ($insightsData as $insightData) {
            $dtos[] = self::fromArray($insightData);
        }

        $dtos[] = self::buildTotalInteractions($dtos);

        return $dtos;
    }

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

    /**
     * @param InstagramPostInsightDTO[] $postInsightDTOs
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
            + ($values[PostInsightType::Comments->value] ?? 0.0)
            + ($values[PostInsightType::Shares->value] ?? 0.0)
            + ($values[PostInsightType::Saved->value] ?? 0.0);

        return new self(
            type: PostInsightType::TotalInteractions,
            value: $totalInteractions,
        );
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }
}
