<?php

namespace App\DTO\Response\Post;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class PostListItemResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_posts_list'])]
        private readonly string $uuid,
        #[Groups(['api_posts_list'])]
        private readonly ?string $caption,
        #[Groups(['api_posts_list'])]
        private readonly \DateTimeImmutable $publishedAt,
        #[Groups(['api_posts_list'])]
        private readonly string $platform,
        #[Groups(['api_posts_list'])]
        private readonly ?float $views,
        #[Groups(['api_posts_list'])]
        private readonly ?float $totalInteractions,
        #[Groups(['api_posts_list'])]
        private readonly ?float $engagementByViews,
    ) {}

    public function getData(): array
    {
        return [
            'uuid' => $this->uuid,
            'caption' => $this->caption,
            'publishedAt' => $this->publishedAt,
            'platform' => $this->platform,
            'views' => $this->views,
            'totalInteractions' => $this->totalInteractions,
            'engagementByViews' => $this->engagementByViews,
        ];
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getCaption(): ?string
    {
        return $this->caption;
    }

    public function getPublishedAt(): \DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function getPlatform(): string
    {
        return $this->platform;
    }

    public function getViews(): ?float
    {
        return $this->views;
    }

    public function getTotalInteractions(): ?float
    {
        return $this->totalInteractions;
    }

    public function getEngagementByViews(): ?float
    {
        return $this->engagementByViews;
    }
}
