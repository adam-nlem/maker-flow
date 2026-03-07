<?php

namespace App\DTO\Response\PostGroup;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\PostGroup;
use Symfony\Component\Serializer\Attribute\Groups;

class PostGroupWithAggregatedInsightsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_post_groups_rank'])]
        private readonly PostGroup $postGroup,
        /** @var array<array{type: string, value: float}> */
        #[Groups(['api_post_groups_rank'])]
        private readonly array $aggregatedInsights,
    ) {}

    public function getData(): array
    {
        return [
            'postGroup' => $this->postGroup,
            'aggregatedInsights' => $this->aggregatedInsights,
        ];
    }

    public function getPostGroup(): PostGroup
    {
        return $this->postGroup;
    }

    public function getAggregatedInsights(): array
    {
        return $this->aggregatedInsights;
    }
}
