<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost;

use App\DTO\Response\ResponseDTOInterface;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsMediaType;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostWithInsightsDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly string $uuid,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly string $externalId,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly SocialAnalyticsMediaType $mediaType,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly \DateTimeImmutable $publishedAt,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly ?string $caption,
        /** @var SocialAnalyticsPostInsightWithEvolutionDTO[] */
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly array $insights,
    ) {}

    public function getData(): array
    {
        return [
            'uuid' => $this->uuid,
            'externalId' => $this->externalId,
            'mediaType' => $this->mediaType->value,
            'publishedAt' => $this->publishedAt->format(\DateTimeInterface::ATOM),
            'caption' => $this->caption,
            'insights' => $this->insights,
        ];
    }

    public function getUuid(): string
    {
        return $this->uuid;
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

    public function getInsights(): array
    {
        return $this->insights;
    }
}
