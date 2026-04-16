<?php

namespace App\DTO\External\Tiktok;

use App\Entity\Enum\MediaType;

class TiktokPostDTO
{
    public function __construct(
        private readonly string $externalId,
        private readonly MediaType $mediaType,
        private readonly \DateTimeImmutable $publishedAt,
        private readonly int $duration,
        private readonly ?string $caption,
        private readonly ?string $thumbnailUrl,
        private readonly string $externalUrl,
        /** @var TiktokPostInsightDTO[] $postInsights */
        private readonly array $postInsights,
    ) {}

    public static function fromArray(array $data): self
    {
        $postInsightDTOs = TiktokPostInsightDTO::fromVideoData($data);

        return new self(
            externalId: $data['id'],
            mediaType: MediaType::Video,
            publishedAt: (new \DateTimeImmutable())->setTimestamp($data['create_time']),
            duration: $data['duration'] ?? 0,
            caption: $data['title'] ?? null,
            thumbnailUrl: $data['cover_image_url'] ?? null,
            externalUrl: $data['share_url'] ?? '',
            postInsights: $postInsightDTOs,
        );
    }

    public function getExternalId(): string
    {
        return $this->externalId;
    }

    public function getMediaType(): MediaType
    {
        return $this->mediaType;
    }

    public function getPublishedAt(): \DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function getDuration(): int
    {
        return $this->duration;
    }

    public function getCaption(): ?string
    {
        return $this->caption;
    }

    public function getThumbnailUrl(): ?string
    {
        return $this->thumbnailUrl;
    }

    public function getExternalUrl(): string
    {
        return $this->externalUrl;
    }

    public function getPostInsights(): array
    {
        return $this->postInsights;
    }
}
