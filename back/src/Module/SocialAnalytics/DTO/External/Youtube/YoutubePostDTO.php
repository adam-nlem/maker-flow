<?php

namespace App\Module\SocialAnalytics\DTO\External\Youtube;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsMediaType;
use Google\Service\YouTube\Video;

class YoutubePostDTO
{
    public function __construct(
        private readonly string $externalId,
        private readonly SocialAnalyticsMediaType $mediaType,
        private readonly \DateTimeImmutable $publishedAt,
        private readonly int $duration,
        private readonly ?string $caption,
        private readonly ?string $thumbnailUrl,
        private readonly string $externalUrl,
        /** @var YoutubePostInsightDTO[] */
        private array $postInsights,
    ) {}

    public static function fromVideo(Video $video): self
    {
        $snippet = $video->getSnippet();
        $contentDetails = $video->getContentDetails();
        $statistics = $video->getStatistics();

        $postInsights = [];

        foreach (YoutubePostInsightDTO::getDataApiMetrics() as $metric) {
            $value = match ($metric) {
                'viewCount' => (int) ($statistics->getViewCount() ?? 0),
                'likeCount' => (int) ($statistics->getLikeCount() ?? 0),
                'commentCount' => (int) ($statistics->getCommentCount() ?? 0),
            };

            $type = YoutubePostInsightDTO::getMetricMapping()[$metric] ?? null;
            $postInsights[] = new YoutubePostInsightDTO(type: $type, value: $value);
        }

        $thumbnailUrl = null;
        $thumbnails = $snippet->getThumbnails();
        if ($thumbnails !== null) {
            $high = $thumbnails->getHigh();
            $thumbnailUrl = $high?->getUrl();
        }

        return new self(
            externalId: $video->getId(),
            mediaType: SocialAnalyticsMediaType::Video,
            publishedAt: new \DateTimeImmutable($snippet->getPublishedAt()),
            duration: self::parseIsoDuration($contentDetails->getDuration()),
            caption: $snippet->getTitle(),
            thumbnailUrl: $thumbnailUrl,
            externalUrl: sprintf('https://www.youtube.com/watch?v=%s', $video->getId()),
            postInsights: $postInsights,
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

    /**
     * @return YoutubePostInsightDTO[]
     */
    public function getPostInsights(): array
    {
        return $this->postInsights;
    }

    public function addPostInsight(YoutubePostInsightDTO $insight): void
    {
        $this->postInsights[] = $insight;
    }

    /**
     * Parses ISO 8601 duration (e.g., PT1H2M30S) to seconds.
     */
    private static function parseIsoDuration(string $duration): int
    {
        try {
            $interval = new \DateInterval($duration);

            return ($interval->h * 3600) + ($interval->i * 60) + $interval->s;
        } catch (\Exception) {
            return 0;
        }
    }
}
