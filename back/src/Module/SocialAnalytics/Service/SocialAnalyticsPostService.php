<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost\SocialAnalyticsPostWithInsightsDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Helper\InsightHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsPostService
{
    private const THUMBNAIL_BASE_PATH = '/private/uploads/social-analytics/%s/post/thumbnail';

    public function __construct(
        private readonly SocialAnalyticsPostRepository $repository,
        private readonly SocialAnalyticsPostInsightRepository $insightRepository,
        private readonly SocialAnalyticsIntegrationInsightRepository $integrationInsightRepository,
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
            ->setExternalUrl($postDTO->getExternalUrl())
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

    //TODO: Add a placeholder
    public function getPostThumbnail(SocialAnalyticsPost $post): ?\Symfony\Component\HttpFoundation\File\File
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
        SocialAnalyticsPostInsightType::Reach,
    ];

    /**
     * @return SocialAnalyticsPostWithInsightsDTO[]
     */
    public function getPostsWithInsights(
        User $user,
        Integration $integration,
        int $page,
        int $limit,
        SocialAnalyticsTimePeriod $timePeriod,
    ): array {
        $now = DateHelper::createUtcDateTimeImmutable();
        $periodStart = $now->modify("-{$timePeriod->getDaysCount()} days");

        $posts = $this->repository->getByUserAndIntegrationAndPublishedAfterPaginated($user, $integration, $periodStart, $page, $limit);

        if (empty($posts)) {
            return [];
        }
        $totalFollowers = $this->integrationInsightRepository->getLatestByUserAndByIntegrationAndByType($user, $integration, SocialAnalyticsIntegrationInsightType::TotalFollowers);

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
                fn(SocialAnalyticsPostInsight $insight) => !in_array($insight->getType(), self::EXCLUDED_INSIGHT_TYPES),
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
                    SocialAnalyticsPostInsightType::Views->value,
                    SocialAnalyticsPostInsightType::Likes->value,
                    SocialAnalyticsPostInsightType::Comments->value,
                    SocialAnalyticsPostInsightType::Shares->value,
                    SocialAnalyticsPostInsightType::Saved->value,
                    SocialAnalyticsPostInsightType::AverageWatchTime->value,
                    SocialAnalyticsPostInsightType::TotalWatchTime->value,
                ],
            );

            $totalInteractions = InsightHelper::getInsightValueByType($allInsights, SocialAnalyticsPostInsightType::TotalInteractions);
            $reach = InsightHelper::getInsightValueByType($allInsights, SocialAnalyticsPostInsightType::Reach);

            $result[] = new SocialAnalyticsPostWithInsightsDTO(
                post: $post,
                insights: $insightsWithEvolution,
                engagementByFollowers: InsightHelper::calculateEngagement($totalInteractions, $totalFollowers?->getValue()),
                engagementByReach: InsightHelper::calculateEngagement($totalInteractions, $reach),
            );
        }

        return $result;
    }

    private function calculatePostAgeDuration(SocialAnalyticsPost $post, \DateTimeImmutable $now): \DateInterval
    {
        $publishedAt = $post->getPublishedAt();
        return $publishedAt->diff($now);
    }

}
