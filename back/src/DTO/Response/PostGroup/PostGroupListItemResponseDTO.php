<?php

namespace App\DTO\Response\PostGroup;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class PostGroupListItemResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_post_groups_list'])]
        private readonly string $uuid,
        #[Groups(['api_post_groups_list'])]
        private readonly string $title,
        #[Groups(['api_post_groups_list'])]
        private readonly \DateTimeImmutable $createdAt,
        #[Groups(['api_post_groups_list'])]
        private readonly int $postCount,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $views,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $totalInteractions,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $engagementByViews,
        #[Groups(['api_post_groups_list'])]
        private readonly ?string $scriptTitle,
    ) {}

    public function getData(): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'createdAt' => $this->createdAt,
            'postCount' => $this->postCount,
            'views' => $this->views,
            'totalInteractions' => $this->totalInteractions,
            'engagementByViews' => $this->engagementByViews,
            'scriptTitle' => $this->scriptTitle,
        ];
    }

    public function getUuid(): string
    {
        return $this->uuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getPostCount(): int
    {
        return $this->postCount;
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

    public function getScriptTitle(): ?string
    {
        return $this->scriptTitle;
    }
}
