<?php

namespace App\DTO\External\Youtube;

use Google\Service\YouTube\Channel;

class YoutubeChannelDTO
{
    public function __construct(
        private readonly string $channelId,
        private readonly string $title,
        private readonly ?string $customUrl,
        private readonly ?string $thumbnailUrl,
    ) {}

    public static function fromGoogleChannel(Channel $channel): self
    {
        $snippet = $channel->getSnippet();
        $thumbnails = $snippet?->getThumbnails();
        $defaultThumbnail = $thumbnails?->getDefault();

        return new self(
            channelId: $channel->getId(),
            title: $snippet?->getTitle() ?? '',
            customUrl: $snippet?->getCustomUrl(),
            thumbnailUrl: $defaultThumbnail?->getUrl(),
        );
    }

    public function getChannelId(): string
    {
        return $this->channelId;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getCustomUrl(): ?string
    {
        return $this->customUrl;
    }

    public function getThumbnailUrl(): ?string
    {
        return $this->thumbnailUrl;
    }
}
