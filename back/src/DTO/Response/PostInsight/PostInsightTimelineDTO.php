<?php

namespace App\DTO\Response\PostInsight;

use App\Entity\Enum\PostInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class PostInsightTimelineDTO
{
    public function __construct(
        #[Groups(['api_post_insights_detail'])]
        private readonly PostInsightType $type,
        /** @var PostInsightTimelinePointDTO[] */
        #[Groups(['api_post_insights_detail'])]
        private readonly array $points,
    ) {}

    public function getType(): PostInsightType
    {
        return $this->type;
    }

    /**
     * @return PostInsightTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
