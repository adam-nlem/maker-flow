<?php

namespace App\DTO\Response\Post;

use App\Entity\Enum\PostInsightType;
use App\Entity\PostInsight;
use Symfony\Component\Serializer\Attribute\Groups;

class PostInsightWithEvolutionDTO
{
    public function __construct(
        #[Groups(['api_posts_list', 'api_post_insights_detail'])]
        private readonly PostInsight $insight,
        #[Groups(['api_posts_list', 'api_post_insights_detail'])]
        private readonly ?string $evolutionPercentage,
    ) {}

    public function getInsight(): PostInsight
    {
        return $this->insight;
    }

    public function getEvolutionPercentage(): ?string
    {
        return $this->evolutionPercentage;
    }
}
