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
        private readonly array $postUuids,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $views,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $likes,
        #[Groups(['api_post_groups_list'])]
        private readonly ?float $comments,
        #[Groups(['api_post_groups_list'])]
        private readonly ?string $scriptTitle,
    ) {}

    public function getData(): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'createdAt' => $this->createdAt,
            'postUuids' => $this->postUuids,
            'views' => $this->views,
            'likes' => $this->likes,
            'comments' => $this->comments,
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

    public function getPostUuids(): array
    {
        return $this->postUuids;
    }

    public function getViews(): ?float
    {
        return $this->views;
    }

    public function getLikes(): ?float
    {
        return $this->likes;
    }

    public function getComments(): ?float
    {
        return $this->comments;
    }

    public function getScriptTitle(): ?string
    {
        return $this->scriptTitle;
    }
}
