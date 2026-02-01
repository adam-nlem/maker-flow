<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostInsightDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\ShowSocialAnalyticsPostInsightDetailResponseDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostInsightTimelineDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostInsightTimelinePointDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Helper\InsightHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsPostInsightService
{
    private const TIMELINE_TYPES = [
        SocialAnalyticsPostInsightType::Views,
        SocialAnalyticsPostInsightType::Likes,
        SocialAnalyticsPostInsightType::Comments,
        SocialAnalyticsPostInsightType::Shares,
        SocialAnalyticsPostInsightType::AverageWatchTime,
        SocialAnalyticsPostInsightType::TotalWatchTime,
    ];

    private const EXCLUDED_INSIGHT_TYPES = [
        SocialAnalyticsPostInsightType::Reach,
    ];

    private string $instagramGraphUrl;

    public function __construct(
        private readonly SocialAnalyticsPostInsightRepository $postInsightRepository,
        private readonly SocialAnalyticsPostRepository $postRepository,
        private readonly SocialAnalyticsIntegrationInsightRepository $integrationInsightRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostService $postService,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    public function fetchInstagramPostInsights(Integration $integration): void
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $url = sprintf('%s/%s/media', $this->instagramGraphUrl, $integration->getAccountId());

        $metrics = implode(',', InstagramPostInsightDTO::getMetricNames());

        $queryParams =  [
            'fields' => sprintf('id,media_type,timestamp,thumbnail_url,caption,permalink,insights.metric(%s)', $metrics),
            'limit' => 100,
            'access_token' => $integration->getAccessToken(),
        ];

        do {
            $response = $this->httpClient->request('GET', $url, ['query' => $queryParams]);
            $data = $response->toArray();

            foreach ($data['data'] as $postData) {
                $this->processPostData($integration, $postData);
            }

            $url = $data['paging']['next'] ?? null;
            $queryParams = [];
        } while ($url !== null);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    public function getDetail(User $user, SocialAnalyticsPost $post): ShowSocialAnalyticsPostInsightDetailResponseDTO
    {
        $now = DateHelper::createUtcDateTimeImmutable();

        $latestInsightsByType = $this->postInsightRepository->getLatestByPostGroupedByType($post);

        // Needed to calculate engagement
        $totalInteractions = InsightHelper::getInsightValueByType($latestInsightsByType, SocialAnalyticsPostInsightType::TotalInteractions);
        $reach = InsightHelper::getInsightValueByType($latestInsightsByType, SocialAnalyticsPostInsightType::Reach);

        $postAgeDuration = $post->getPublishedAt()->diff($now);

        $previousPost = $this->postRepository->getSingleByIntegrationAndPublishedBeforeDate(
            $post->getIntegration(),
            $post->getPublishedAt(),
        );

        $previousInsights = [];
        if ($previousPost !== null) {
            $previousInsightsCreatedBefore = $previousPost->getPublishedAt()->add($postAgeDuration);
            $previousInsights = $this->postInsightRepository->getLatestByPostGroupedByTypeBeforeDate(
                $previousPost,
                $previousInsightsCreatedBefore,
                self::EXCLUDED_INSIGHT_TYPES,
            );
        }

        $insightsWithEvolution = InsightEvolutionHelper::buildPostInsightsWithEvolution(
            $latestInsightsByType,
            $previousInsights,
            [
                SocialAnalyticsPostInsightType::Views->value,
                SocialAnalyticsPostInsightType::Likes->value,
                SocialAnalyticsPostInsightType::Comments->value,
                SocialAnalyticsPostInsightType::Shares->value,
                SocialAnalyticsPostInsightType::Saved->value,
                SocialAnalyticsPostInsightType::TotalInteractions->value,
                SocialAnalyticsPostInsightType::AverageWatchTime->value,
                SocialAnalyticsPostInsightType::TotalWatchTime->value,
            ],
        );

        // 3. Timeline data for current post (DB-filtered by type)
        $currentPostTimelineInsights = $this->postInsightRepository->getByPostAndTypes($post, self::TIMELINE_TYPES);

        // 4. Fetch 10 previous posts
        $previousPosts = $this->postRepository->getByUserAndIntegrationAndPublishedBeforeLimited(
            $user,
            $post->getIntegration(),
            $post->getPublishedAt(),
            10,
        );

        // 5. Timeline data for previous posts (DB-filtered by type)
        $previousPostsInsights = [];
        if (!empty($previousPosts)) {
            $previousPostIds = array_map(fn(SocialAnalyticsPost $p) => $p->getId(), $previousPosts);
            $previousPostsInsights = $this->postInsightRepository->getByPostIdsAndTypes($previousPostIds, self::TIMELINE_TYPES);
        }

        // 6. Build timelines
        $timelines = $this->buildTimelines($post, $currentPostTimelineInsights, $previousPosts, $previousPostsInsights);

        // 7. Compute engagement
        $totalFollowersInsight = $this->integrationInsightRepository->getLatestByUserAndByIntegrationAndByType(
            $user,
            $post->getIntegration(),
            SocialAnalyticsIntegrationInsightType::TotalFollowers,
        );
        $totalFollowers = $totalFollowersInsight?->getValue();

        return new ShowSocialAnalyticsPostInsightDetailResponseDTO(
            post: $post,
            insightsWithEvolution: $insightsWithEvolution,
            engagementByFollowers: InsightHelper::calculateEngagement($totalInteractions, $totalFollowers),
            engagementByReach: InsightHelper::calculateEngagement($totalInteractions, $reach),
            timelines: $timelines,
        );
    }

    /**
     * @param SocialAnalyticsPostInsight[] $currentPostInsights
     * @param SocialAnalyticsPost[] $previousPosts
     * @param SocialAnalyticsPostInsight[] $previousPostsInsights
     * @return SocialAnalyticsPostInsightTimelineDTO[]
     */
    private function buildTimelines(
        SocialAnalyticsPost $post,
        array $currentPostInsights,
        array $previousPosts,
        array $previousPostsInsights,
    ): array {
        // Group previous posts insights by post ID and type
        $previousInsightsByPostAndType = [];
        foreach ($previousPostsInsights as $insight) {
            $postId = $insight->getSocialAnalyticsPost()->getId();
            $typeValue = $insight->getType()->value;
            $previousInsightsByPostAndType[$postId][$typeValue][] = $insight;
        }

        // Index previous posts by ID for quick lookup
        $previousPostsById = [];
        foreach ($previousPosts as $prevPost) {
            $previousPostsById[$prevPost->getId()] = $prevPost;
        }

        $timelines = [];

        foreach (self::TIMELINE_TYPES as $type) {
            $currentTypeInsights = array_filter(
                $currentPostInsights,
                fn(SocialAnalyticsPostInsight $i) => $i->getType() === $type,
            );

            $points = [];
            foreach ($currentTypeInsights as $insight) {
                $hoursAfterPublication = $this->calculateHoursAfterPublication(
                    $post->getPublishedAt(),
                    $insight->getCreatedAt(),
                );

                $averageValue = $this->calculateAverageAtOffset(
                    $type,
                    $hoursAfterPublication,
                    $previousPostsById,
                    $previousInsightsByPostAndType,
                );

                $points[] = new SocialAnalyticsPostInsightTimelinePointDTO(
                    hoursAfterPublication: round($hoursAfterPublication, 1),
                    value: $insight->getValue(),
                    averageValue: $averageValue,
                );
            }

            $timelines[] = new SocialAnalyticsPostInsightTimelineDTO(
                type: $type,
                points: $points,
            );
        }

        return $timelines;
    }

    private function calculateHoursAfterPublication(
        \DateTimeImmutable $publishedAt,
        \DateTimeImmutable $createdAt,
    ): float {
        $diffSeconds = $createdAt->getTimestamp() - $publishedAt->getTimestamp();

        return $diffSeconds / 3600;
    }

    /**
     * @param array<int, SocialAnalyticsPost> $previousPostsById
     * @param array<int, array<string, SocialAnalyticsPostInsight[]>> $previousInsightsByPostAndType
     */
    private function calculateAverageAtOffset(
        SocialAnalyticsPostInsightType $type,
        float $hoursAfterPublication,
        array $previousPostsById,
        array $previousInsightsByPostAndType,
    ): ?float {
        $values = [];

        foreach ($previousPostsById as $postId => $prevPost) {
            $typeInsights = $previousInsightsByPostAndType[$postId][$type->value] ?? [];

            if (empty($typeInsights)) {
                continue;
            }

            // Find the latest insight where (createdAt - publishedAt) <= hoursAfterPublication
            $bestValue = null;
            foreach ($typeInsights as $insight) {
                $insightHours = $this->calculateHoursAfterPublication(
                    $prevPost->getPublishedAt(),
                    $insight->getCreatedAt(),
                );

                if ($insightHours <= $hoursAfterPublication) {
                    $bestValue = $insight->getValue();
                }
            }

            if ($bestValue !== null) {
                $values[] = $bestValue;
            }
        }

        if (empty($values)) {
            return null;
        }

        return round(array_sum($values) / count($values), 1);
    }

    private function processPostData(Integration $integration, array $postData): void
    {
        $postDTO = InstagramPostDTO::fromArray($postData);

        $post = $this->postService->createOrGetPost(
            $integration,
            $postDTO
        );

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    private function createPostInsights(SocialAnalyticsPost $post, array $postInsightDTOs): void
    {
        /** @var InstagramPostInsightDTO $postInsightDTO */
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($this->shouldCreateInsight(post: $post, postInsightDTO: $postInsightDTO)) {

                // The value returned by Instagram is in milliseconds, so we need to convert it to seconds
                if ($postInsightDTO->getType() === SocialAnalyticsPostInsightType::AverageWatchTime || $postInsightDTO->getType() === SocialAnalyticsPostInsightType::TotalWatchTime) {
                    $value = ($postInsightDTO->getValue() / 1000);
                } else {
                    $value = $postInsightDTO->getValue();
                }

                $insight = new SocialAnalyticsPostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($value)
                    ->setSocialAnalyticsPost($post)
                    ->setUser($post->getUser());

                $this->postInsightRepository->save(entity: $insight);
            }
        }
    }

    private function shouldCreateInsight(SocialAnalyticsPost $post, InstagramPostInsightDTO $postInsightDTO): bool
    {
        if ($post->getId() === null) {
            return true;
        }

        return $this->postInsightRepository->getLatestByPostAndByTypeAndByValue(
            post: $post,
            type: $postInsightDTO->getType(),
            value: $postInsightDTO->getValue()
        ) === null;
    }
}
