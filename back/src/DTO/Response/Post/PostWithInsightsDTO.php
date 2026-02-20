<?php

namespace App\DTO\Response\Post;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Post;
use Symfony\Component\Serializer\Attribute\Groups;

class PostWithInsightsDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_posts_list'])]
        private readonly Post $post,
        /** @var PostInsightWithEvolutionDTO[] */
        #[Groups(['api_posts_list'])]
        private readonly array $insights,
        #[Groups(['api_posts_list'])]
        private readonly ?float $engagementByFollowers,
        #[Groups(['api_posts_list'])]
        private readonly ?float $engagementByReach,
    ) {}

    public function getData(): array
    {
        return [
            'post' => $this->post,
            'insights' => $this->insights,
            'engagementByFollowers' => $this->engagementByFollowers,
            'engagementByReach' => $this->engagementByReach,
        ];
    }

    public function getPost(): Post
    {
        return $this->post;
    }

    public function getInsights(): array
    {
        return $this->insights;
    }

    public function getEngagementByFollowers(): ?float
    {
        return $this->engagementByFollowers;
    }

    public function getEngagementByReach(): ?float
    {
        return $this->engagementByReach;
    }
}
