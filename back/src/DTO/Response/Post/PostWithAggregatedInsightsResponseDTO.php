<?php

namespace App\DTO\Response\Post;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Post;
use Symfony\Component\Serializer\Attribute\Groups;

class PostWithAggregatedInsightsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_posts_rank'])]
        private readonly Post $post,
        /** @var array<array{type: string, value: float}> */
        #[Groups(['api_posts_rank'])]
        private readonly array $aggregatedInsights,
    ) {}

    public function getData(): array
    {
        return [
            'post' => $this->post,
            'aggregatedInsights' => $this->aggregatedInsights,
        ];
    }

    public function getPost(): Post
    {
        return $this->post;
    }

    public function getAggregatedInsights(): array
    {
        return $this->aggregatedInsights;
    }
}
