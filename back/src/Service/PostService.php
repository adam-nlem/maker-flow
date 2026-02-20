<?php

namespace App\Service;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\DTO\External\Instagram\InstagramPostDTO;
use App\DTO\External\Youtube\YoutubePostDTO;
use App\DTO\Response\Post\PostWithInsightsDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Enum\TimePeriod;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Helper\InsightEvolutionHelper;
use App\Helper\InsightHelper;
use App\Entity\Enum\IntegrationInsightType;
use App\Repository\IntegrationInsightRepository;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PostService
{
    private const THUMBNAIL_BASE_PATH = '/private/uploads/social-analytics/%s/post/thumbnail';

    public function __construct(
        private readonly PostRepository $repository,
        private readonly PostInsightRepository $insightRepository,
        private readonly IntegrationInsightRepository $integrationInsightRepository,
        private readonly HttpClientInterface $httpClient,
        private readonly Filesystem $filesystem,
        private readonly ParameterBagInterface $parameterBag,
    ) {}

    public function createOrGetPost(
        Integration $integration,
        InstagramPostDTO $postDTO
    ): Post {
        $existingPost = $this->repository->getByExternalIdAndIntegration($postDTO->getExternalId(), $integration);

        if ($existingPost !== null) {
            if ($existingPost->getCaption() !== $postDTO->getCaption()) {
                $existingPost->setCaption($postDTO->getCaption());
                $this->repository->save($existingPost);
            }

            return $existingPost;
        }

        $post = new Post();
        $post
            ->setExternalId($postDTO->getExternalId())
            ->setMediaType($postDTO->getMediaType())
            ->setPublishedAt($postDTO->getPublishedAt())
            ->setDuration(0)
            ->setCaption($postDTO->getCaption())
            ->setExternalUrl($postDTO->getExternalUrl())
            ->setIntegration($integration)
            ->setUser($integration->getUser());

        if ($postDTO->getThumbnailUrl() !== null) {
            $this->downloadAndStoreThumbnail($post, $postDTO->getThumbnailUrl());
        }

        $this->repository->save($post);

        return $post;
    }

    public function createOrGetYoutubePost(
        Integration $integration,
        YoutubePostDTO $postDTO
    ): Post {
        $existingPost = $this->repository->getByExternalIdAndIntegration($postDTO->getExternalId(), $integration);

        if ($existingPost !== null) {
            if ($existingPost->getCaption() !== $postDTO->getCaption()) {
                $existingPost->setCaption($postDTO->getCaption());
                $this->repository->save($existingPost);
            }

            return $existingPost;
        }

        $post = new Post();
        $post
            ->setExternalId($postDTO->getExternalId())
            ->setMediaType($postDTO->getMediaType())
            ->setPublishedAt($postDTO->getPublishedAt())
            ->setDuration($postDTO->getDuration())
            ->setCaption($postDTO->getCaption())
            ->setExternalUrl($postDTO->getExternalUrl())
            ->setIntegration($integration)
            ->setUser($integration->getUser());

        if ($postDTO->getThumbnailUrl() !== null) {
            $this->downloadAndStoreThumbnail($post, $postDTO->getThumbnailUrl());
        }

        $this->repository->save($post);

        return $post;
    }

    public function downloadAndStoreThumbnail(Post $post, string $thumbnailUrl): ?string
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

    //TODO: Add a placeholder
    public function getPostThumbnail(Post $post): ?\Symfony\Component\HttpFoundation\File\File
    {
        $provider = strtolower($post->getIntegration()->getProvider()->value);
        $thumbnailDirectory = $this->getThumbnailDirectory($provider);

        $possibleExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

        foreach ($possibleExtensions as $extension) {
            $filePath = sprintf('%s/%s.%s', $thumbnailDirectory, $post->getUuid(), $extension);
            if (file_exists($filePath)) {
                return new File($filePath, false);
            }
        }

        return null;
    }

    private const EXCLUDED_INSIGHT_TYPES = [
        PostInsightType::Reach,
    ];

    /**
     * @return PostWithInsightsDTO[]
     */
    public function getPostsWithInsights(
        User $user,
        Integration $integration,
        int $page,
        int $limit,
        TimePeriod $timePeriod,
    ): array {
        $now = DateHelper::createUtcDateTimeImmutable();
        $periodStart = $now->modify("-{$timePeriod->getDaysCount()} days");

        $posts = $this->repository->getByUserAndIntegrationAndPublishedAfterPaginated($user, $integration, $periodStart, $page, $limit);

        if (empty($posts)) {
            return [];
        }
        $totalFollowers = $this->integrationInsightRepository->getLatestByUserAndByIntegrationAndByType($user, $integration, IntegrationInsightType::TotalFollowers);

        $result = [];
        foreach ($posts as $post) {
            $postAgeDuration = $this->calculatePostAgeDuration($post, $now);
            $insightsCreatedBefore = $post->getPublishedAt()->add($postAgeDuration);

            $allInsights = $this->insightRepository->getLatestByPostGroupedByTypeBeforeDate(
                $post,
                $insightsCreatedBefore,
            );

            $currentInsights = array_filter(
                $allInsights,
                fn(PostInsight $insight) => !in_array($insight->getType(), self::EXCLUDED_INSIGHT_TYPES),
            );

            $previousPost = $this->repository->getSingleByIntegrationAndPublishedBeforeDate(
                $post->getIntegration(),
                $post->getPublishedAt(),
            );
            $previousInsights = [];

            if ($previousPost !== null) {
                $previousInsightsCreatedBefore = $previousPost->getPublishedAt()->add($postAgeDuration);
                $previousInsights = $this->insightRepository->getLatestByPostGroupedByTypeBeforeDate(
                    $previousPost,
                    $previousInsightsCreatedBefore,
                    self::EXCLUDED_INSIGHT_TYPES,
                );
            }

            $insightsWithEvolution = InsightEvolutionHelper::buildPostInsightsWithEvolution(
                $currentInsights,
                $previousInsights,
                [
                    PostInsightType::Views->value,
                    PostInsightType::Likes->value,
                    PostInsightType::Comments->value,
                    PostInsightType::Shares->value,
                    PostInsightType::Saved->value,
                    PostInsightType::AverageWatchTime->value,
                    PostInsightType::TotalWatchTime->value,
                ],
            );

            $totalInteractions = InsightHelper::getInsightValueByType($allInsights, PostInsightType::TotalInteractions);
            $reach = InsightHelper::getInsightValueByType($allInsights, PostInsightType::Reach);

            $result[] = new PostWithInsightsDTO(
                post: $post,
                insights: $insightsWithEvolution,
                engagementByFollowers: InsightHelper::calculateEngagement($totalInteractions, $totalFollowers?->getValue()),
                engagementByReach: InsightHelper::calculateEngagement($totalInteractions, $reach),
            );
        }

        return $result;
    }

    private function calculatePostAgeDuration(Post $post, \DateTimeImmutable $now): \DateInterval
    {
        $publishedAt = $post->getPublishedAt();
        return $publishedAt->diff($now);
    }

}
