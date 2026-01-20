<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsPostService
{
    private const THUMBNAIL_BASE_PATH = '/private/uploads/social-analytics/%s/post/thumbnail';

    public function __construct(
        private readonly SocialAnalyticsPostRepository $repository,
        private readonly HttpClientInterface $httpClient,
        private readonly Filesystem $filesystem,
        private readonly ParameterBagInterface $parameterBag,
    ) {}

    public function createOrGetPost(
        Integration $integration,
        InstagramPostDTO $postDTO
    ): SocialAnalyticsPost {
        $existingPost = $this->repository->getByExternalIdAndIntegration($postDTO->getExternalId(), $integration);

        if ($existingPost !== null) {
            return $existingPost;
        }

        $post = new SocialAnalyticsPost();
        $post
            ->setExternalId($postDTO->getExternalId())
            ->setMediaType($postDTO->getMediaType())
            ->setPublishedAt($postDTO->getPublishedAt())
            ->setDuration(0)
            ->setCaption($postDTO->getCaption())
            ->setIntegration($integration)
            ->setUser($integration->getUser());

        if ($postDTO->getThumbnailUrl() !== null) {
            $this->downloadAndStoreThumbnail($post, $postDTO->getThumbnailUrl());
        }

        $this->repository->save($post);

        return $post;
    }

    public function downloadAndStoreThumbnail(SocialAnalyticsPost $post, string $thumbnailUrl): ?string
    {
        $provider = strtolower($post->getIntegration()->getProvider()->value);
        $thumbnailDirectory = $this->getThumbnailDirectory($provider);

        if (!$this->filesystem->exists($thumbnailDirectory)) {
            $this->filesystem->mkdir($thumbnailDirectory);
        }

        $extension = $this->getExtensionFromUrl($thumbnailUrl);
        $filename = sprintf('%s.%s', $post->getUuid(), $extension);
        $filePath = sprintf('%s/%s', $thumbnailDirectory, $filename);

        $response = $this->httpClient->request('GET', $thumbnailUrl);

        if ($response->getStatusCode() !== 200) {
            return null;
        }

        $this->filesystem->dumpFile($filePath, $response->getContent());

        return $filePath;
    }

    private function getThumbnailDirectory(string $provider): string
    {
        $projectDir = $this->parameterBag->get('kernel.project_dir');

        return sprintf('%s%s', $projectDir, sprintf(self::THUMBNAIL_BASE_PATH, $provider));
    }

    private function getExtensionFromUrl(string $url): string
    {
        $path = parse_url($url, PHP_URL_PATH);
        $extension = pathinfo($path, PATHINFO_EXTENSION);

        return $extension ?: 'jpg';
    }
}
