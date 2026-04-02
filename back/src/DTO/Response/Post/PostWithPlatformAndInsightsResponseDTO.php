<?php

namespace App\DTO\Response\Post;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Post;
use Symfony\Component\Serializer\Attribute\Groups;

class PostWithPlatformAndInsightsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_posts_list'])]
        private readonly Post $post,
        #[Groups(['api_posts_list'])]
        private readonly string $platform,
        /** @var array<array{type: string, value: float}> */
        #[Groups(['api_posts_list'])]
        private readonly array $aggregatedInsights,
        #[Groups(['api_posts_list'])]
        private readonly ?string $postGroupUuid,
        #[Groups(['api_posts_list'])]
        private readonly ?string $postGroupTitle,
        #[Groups(['api_posts_list'])]
        private readonly ?float $engagementByViews,
    ) {}

    public function getData(): array
    {
        return [
            'post' => $this->post,
            'platform' => $this->platform,
            'aggregatedInsights' => $this->aggregatedInsights,
            'postGroupUuid' => $this->postGroupUuid,
            'postGroupTitle' => $this->postGroupTitle,
            'engagementByViews' => $this->engagementByViews,
        ];
    }

    public function getPost(): Post
    {
        return $this->post;
    }

    public function getPlatform(): string
    {
        return $this->platform;
    }

    public function getAggregatedInsights(): array
    {
        return $this->aggregatedInsights;
    }

    public function getPostGroupUuid(): ?string
    {
        return $this->postGroupUuid;
    }

    public function getPostGroupTitle(): ?string
    {
        return $this->postGroupTitle;
    }

    public function getEngagementByViews(): ?float
    {
        return $this->engagementByViews;
    }
}
