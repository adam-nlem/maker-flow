<?php

namespace App\Module\SocialAnalytics\DTO\External\Instagram;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsMediaType;

class InstagramPostDTO
{
    private const MEDIA_TYPE_MAPPING = [
        'IMAGE' => SocialAnalyticsMediaType::Image,
        'VIDEO' => SocialAnalyticsMediaType::Video,
        'CAROUSEL_ALBUM' => SocialAnalyticsMediaType::Carousel,
    ];

    public function __construct(
        private readonly string $externalId,
        private readonly SocialAnalyticsMediaType $mediaType,
        private readonly \DateTimeImmutable $publishedAt,
        private readonly ?string $caption,
        private readonly ?string $thumbnailUrl,
        /** @var InstagramPostInsightDTO $postInsights */
        private readonly array $postInsights,
    ) {}

    public static function fromArray(array $data): self
    {

        $postInsightDTOs = [];

        foreach ($data['insights']['data'] as $postInsightData) {
            $postInsightDTOs[] = InstagramPostInsightDTO::fromArray($postInsightData);
        }
        return new self(
            externalId: $data['id'],
            mediaType: self::MEDIA_TYPE_MAPPING[$data['media_type']],
            publishedAt: new \DateTimeImmutable($data['timestamp']),
            caption: $data['caption'] ?? null,
            thumbnailUrl: $data['thumbnail_url'] ?? null,
            postInsights: $postInsightDTOs,
        );
    }

    public function getExternalId(): string
    {
        return $this->externalId;
    }

    public function getMediaType(): SocialAnalyticsMediaType
    {
        return $this->mediaType;
    }

    public function getPublishedAt(): \DateTimeImmutable
    {
        return $this->publishedAt;
    }

    public function getCaption(): ?string
    {
        return $this->caption;
    }

    public function getThumbnailUrl(): ?string
    {
        return $this->thumbnailUrl;
    }

    public function getPostInsights(): array
    {
        return $this->postInsights;
    }
}
