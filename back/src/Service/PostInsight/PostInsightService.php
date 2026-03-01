<?php

namespace App\Service\PostInsight;

use App\Entity\Enum\Platform;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\DTO\External\Instagram\InstagramPostInsightDTO;
use App\DTO\Response\PostInsight\ShowPostInsightDetailResponseDTO;
use App\DTO\Response\PostInsight\PostInsightTimelineDTO;
use App\DTO\Response\PostInsight\PostInsightTimelinePointDTO;
use App\DTO\Response\PostInsight\PostRankingItemDTO;
use App\Entity\Enum\IntegrationInsightType;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Helper\InsightEvolutionHelper;
use App\Helper\InsightHelper;
use App\Helper\TimelineGapFillerHelper;
use App\Repository\IntegrationInsightRepository;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;
use App\Repository\IntegrationRepository;
use App\Entity\Enum\YoutubeReportType;
use App\Service\InstagramPostInsight\InstagramPostInsightService;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use App\Service\YoutubePostInsight\YoutubePostInsightService;
use App\Service\YoutubeReporting\YoutubeReportingService;
use Google\Client;
use Google\Service\YouTube;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class PostInsightService
{
    private const TIMELINE_TYPES = [
        PostInsightType::Views,
        PostInsightType::Likes,
        PostInsightType::Comments,
        PostInsightType::Shares,
        PostInsightType::AverageWatchTime,
        PostInsightType::TotalWatchTime,
    ];

    private const RANKING_WEIGHTS = [
        PostInsightType::Views->value => 0.30,
        PostInsightType::Reach->value => 0.25,
        PostInsightType::TotalInteractions->value => 0.25,
        PostInsightType::AverageWatchTime->value => 0.10,
        PostInsightType::TotalWatchTime->value => 0.10,
    ];

    private string $instagramGraphUrl;

    public function __construct(
        private readonly PostInsightRepository $postInsightRepository,
        private readonly PostRepository $postRepository,
        private readonly IntegrationInsightRepository $integrationInsightRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly YoutubeOAuthService $youtubeOAuthService,
        private readonly YoutubePostInsightService $youtubePostInsightService,
        private readonly InstagramPostInsightService $instagramPostInsightService,
        private readonly YoutubeReportingService $youtubeReportingService,
        private readonly Client $googleClient,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    public function fetchInstagramPostInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Instagram) {
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
                $this->instagramPostInsightService->processPostData($integration, $postData);
            }

            $url = $data['paging']['next'] ?? null;
            $queryParams = [];
        } while ($url !== null);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    public function fetchYoutubePostInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Youtube) {
            throw new \InvalidArgumentException('Integration must be a YouTube integration');
        }

        $this->youtubeOAuthService->configureGoogleClient();
        $integration = $this->youtubeOAuthService->refreshTokenIfNeeded($integration);
        $this->googleClient->setAccessToken($integration->getAccessToken());

        $youtube = new YouTube($this->googleClient);

        // Step 1: Get uploads playlist
        $uploadsPlaylistId = $this->youtubePostInsightService->getUploadsPlaylistId($youtube);
        if ($uploadsPlaylistId === null) {
            return;
        }

        // Step 2: Get video IDs
        $videoIds = $this->youtubePostInsightService->fetchVideoIds($youtube, $uploadsPlaylistId);
        if (empty($videoIds)) {
            return;
        }

        // Step 3: Build PostDTOs with metadata from Data API
        $postDTOs = $this->youtubePostInsightService->buildPostDTOs($youtube, $videoIds);

        // Step 4: Create/get posts first so we have Post entities for the reporting service
        foreach ($postDTOs as $postDTO) {
            $this->youtubePostInsightService->processPostData($integration, $postDTO);
        }

        // Step 5: Ensure Reporting API jobs exist
        $reportingJobs = $this->youtubeReportingService->ensureJobsExist($integration);

        // Step 6: Build a map of externalId → Post for breakdown storage
        $posts = $this->postRepository->getByExternalIdsAndIntegration(
            array_keys($postDTOs),
            $integration,
        );

        // We create an array like this one in order to optimize the search in later methods
        $postsByExternalId = [];
        foreach ($posts as $post) {
            $postsByExternalId[$post->getExternalId()] = $post;
        }

        // Step 7: Process reports from Reporting API
        $aggregatedData = [];

        foreach ($reportingJobs as $job) {
            $report = $this->youtubeReportingService->getLatestUnprocessedReport($job);

            if ($report === null) {
                continue;
            }

            $csvContent = $this->youtubeReportingService->downloadReportCsv($report, $integration->getAccessToken());
            $rows = $this->youtubeReportingService->parseCsvToRows($csvContent);

            if ($job->getReportType() === YoutubeReportType::ChannelBasic) {
                $aggregatedData = $this->youtubeReportingService->processBasicReportRows(
                    $rows,
                    $postsByExternalId,
                    $integration,
                );
            }

            $this->youtubeReportingService->markReportProcessed($job, $report);
        }

        // Step 8: Enrich PostDTOs with aggregated report data and persist insights
        if (!empty($aggregatedData)) {
            $this->youtubePostInsightService->enrichPostDTOsFromReports($postDTOs, $aggregatedData);

            foreach ($postDTOs as $postDTO) {
                $this->youtubePostInsightService->processPostData($integration, $postDTO);
            }
        }

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    public function getDetail(User $user, Post $post): ShowPostInsightDetailResponseDTO
    {
        $now = DateHelper::createUtcDateTimeImmutable();

        $latestInsightsByType = $this->postInsightRepository->getLatestByPostGroupedByType($post);

        // Needed to calculate engagement
        $totalInteractions = InsightHelper::getInsightValueByType($latestInsightsByType, PostInsightType::TotalInteractions);
        $reach = InsightHelper::getInsightValueByType($latestInsightsByType, PostInsightType::Reach);

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
            );
        }

        $insightsWithEvolution = InsightEvolutionHelper::buildPostInsightsWithEvolution(
            $latestInsightsByType,
            $previousInsights,
            [
                PostInsightType::Views->value,
                PostInsightType::Likes->value,
                PostInsightType::Comments->value,
                PostInsightType::Shares->value,
                PostInsightType::Saved->value,
                PostInsightType::TotalInteractions->value,
                PostInsightType::AverageWatchTime->value,
                PostInsightType::TotalWatchTime->value,
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
            $previousPostIds = array_map(fn(Post $p) => $p->getId(), $previousPosts);
            $previousPostsInsights = $this->postInsightRepository->getByPostIdsAndTypes($previousPostIds, self::TIMELINE_TYPES);
        }

        // 6. Build timelines
        $timelines = $this->buildTimelines($post, $currentPostTimelineInsights, $previousPosts, $previousPostsInsights);

        // 7. Compute engagement
        $totalFollowersInsight = $this->integrationInsightRepository->getLatestByUserAndByIntegrationAndByType(
            $user,
            $post->getIntegration(),
            IntegrationInsightType::TotalFollowers,
        );
        $totalFollowers = $totalFollowersInsight?->getValue();

        // 8. Build ranking (current post + up to 9 previous posts)
        $rankingPosts = array_slice($previousPosts, 0, 9);
        $ranking = $this->buildRanking($post, $latestInsightsByType, $rankingPosts);

        return new ShowPostInsightDetailResponseDTO(
            post: $post,
            insightsWithEvolution: $insightsWithEvolution,
            engagementByFollowers: InsightHelper::calculateEngagement($totalInteractions, $totalFollowers),
            engagementByReach: InsightHelper::calculateEngagement($totalInteractions, $reach),
            timelines: $timelines,
            ranking: $ranking,
        );
    }

    /**
     * @param PostInsight[] $currentPostInsights
     * @param Post[] $previousPosts
     * @param PostInsight[] $previousPostsInsights
     * @return PostInsightTimelineDTO[]
     */
    private function buildTimelines(
        Post $post,
        array $currentPostInsights,
        array $previousPosts,
        array $previousPostsInsights,
    ): array {
        // Group previous posts insights by post ID and type
        $previousInsightsByPostAndType = [];
        foreach ($previousPostsInsights as $insight) {
            $postId = $insight->getPost()->getId();
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
                fn(PostInsight $i) => $i->getType() === $type,
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

                $points[] = new PostInsightTimelinePointDTO(
                    hoursAfterPublication: round($hoursAfterPublication, 1),
                    value: $insight->getValue(),
                    averageValue: $averageValue,
                );
            }

            $filledPoints = TimelineGapFillerHelper::fillPostInsightTimelinePointsHourlyGaps($points);

            $timelines[] = new PostInsightTimelineDTO(
                type: $type,
                points: $filledPoints,
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
     * @param array<int, Post> $previousPostsById
     * @param array<int, array<string, PostInsight[]>> $previousInsightsByPostAndType
     */
    private function calculateAverageAtOffset(
        PostInsightType $type,
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

    /**
     * @param PostInsight[] $currentPostInsights
     * @param Post[] $previousPosts
     * @return PostRankingItemDTO[]
     */
    private function buildRanking(
        Post $currentPost,
        array $currentPostInsights,
        array $previousPosts,
    ): array {
        // Fetch latest insights per type for all previous posts in one query
        $previousPostIds = array_map(fn(Post $p) => $p->getId(), $previousPosts);
        $allPreviousInsights = $this->postInsightRepository->getLatestByPostIdsGroupedByPostAndType($previousPostIds);

        // Group previous insights by post ID
        $insightsByPostId = [];
        foreach ($allPreviousInsights as $insight) {
            $postId = $insight->getPost()->getId();
            $insightsByPostId[$postId][] = $insight;
        }

        // Calculate score for the current post
        $items = [];
        $items[] = new PostRankingItemDTO(
            post: $currentPost,
            score: $this->calculateRankingScore($currentPostInsights),
        );

        // Calculate score for each previous post
        foreach ($previousPosts as $prevPost) {
            $insights = $insightsByPostId[$prevPost->getId()] ?? [];
            $items[] = new PostRankingItemDTO(
                post: $prevPost,
                score: $this->calculateRankingScore($insights),
            );
        }

        // Sort descending by score
        usort($items, fn(PostRankingItemDTO $a, PostRankingItemDTO $b) => $b->getScore() <=> $a->getScore());

        return $items;
    }

    /**
     * @param PostInsight[] $insights
     */
    private function calculateRankingScore(array $insights): float
    {
        $score = 0.0;

        foreach (self::RANKING_WEIGHTS as $typeValue => $weight) {
            $type = PostInsightType::from($typeValue);
            $value = InsightHelper::getInsightValueByType($insights, $type);
            $score += ($value ?? 0) * $weight;
        }

        return round($score, 2);
    }
}
