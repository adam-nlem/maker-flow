<?php

namespace App\DTO\External\Tiktok;

use App\DTO\External\AbstractPostInsightDTO;
use App\Entity\Enum\PostInsightType;

class TiktokPostInsightDTO extends AbstractPostInsightDTO
{
    private const METRIC_MAPPING = [
        'view_count' => PostInsightType::Views,
        'like_count' => PostInsightType::Likes,
        'comment_count' => PostInsightType::Comments,
        'share_count' => PostInsightType::Shares,
    ];

    private const INTERACTION_TYPES = [
        PostInsightType::Likes,
        PostInsightType::Comments,
        PostInsightType::Shares,
    ];

    /**
     * @return TiktokPostInsightDTO[]
     */
    public static function fromVideoData(array $videoData): array
    {
        $dtos = [];

        foreach (self::METRIC_MAPPING as $field => $type) {
            $value = (float) ($videoData[$field] ?? 0);
            $dtos[] = new self(type: $type, value: $value);
        }

        $dtos[] = self::buildTotalInteractions($dtos);

        return $dtos;
    }

    public static function getMetricNames(): array
    {
        return array_keys(self::METRIC_MAPPING);
    }

    protected static function getInteractionTypes(): array
    {
        return self::INTERACTION_TYPES;
    }
}
