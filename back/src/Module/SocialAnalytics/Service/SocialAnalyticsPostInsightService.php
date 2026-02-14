<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostDTO;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramPostInsightDTO;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostDTO;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostInsightDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\ShowSocialAnalyticsPostInsightDetailResponseDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostInsightTimelineDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostInsightTimelinePointDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight\SocialAnalyticsPostRankingItemDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Helper\InsightHelper;
use App\Module\SocialAnalytics\Helper\TimelineGapFillerHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use Google\Client;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
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

    private const RANKING_WEIGHTS = [
        SocialAnalyticsPostInsightType::Views->value => 0.30,
        SocialAnalyticsPostInsightType::Reach->value => 0.25,
        SocialAnalyticsPostInsightType::TotalInteractions->value => 0.25,
        SocialAnalyticsPostInsightType::AverageWatchTime->value => 0.10,
        SocialAnalyticsPostInsightType::TotalWatchTime->value => 0.10,
    ];

    private string $instagramGraphUrl;

    public function __construct(
        private readonly SocialAnalyticsPostInsightRepository $postInsightRepository,
        private readonly SocialAnalyticsPostRepository $postRepository,
        private readonly SocialAnalyticsIntegrationInsightRepository $integrationInsightRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly SocialAnalyticsPostService $postService,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly YoutubeOAuthService $youtubeOAuthService,
        private readonly Client $googleClient,
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

    public function fetchYoutubePostInsights(Integration $integration): void
    {
        if ($integration->getProvider() !== IntegrationProvider::Youtube) {
            throw new \InvalidArgumentException('Integration must be a YouTube integration');
        }

        $this->youtubeOAuthService->configureGoogleClient();
        $integration = $this->youtubeOAuthService->refreshTokenIfNeeded($integration);
        $this->googleClient->setAccessToken($integration->getAccessToken());

        $youtube = new YouTube($this->googleClient);

        // Step 1: Get the uploads playlist ID
        $channelResponse = $youtube->channels->listChannels('contentDetails', ['mine' => true]);
        $channels = $channelResponse->getItems();

        if (empty($channels)) {
            return;
        }

        $uploadsPlaylistId = $channels[0]->getContentDetails()->getRelatedPlaylists()->getUploads();

        // Step 2: Collect all video IDs from the uploads playlist
        $videoIds = [];
        $pageToken = null;

        do {
            $params = [
                'playlistId' => $uploadsPlaylistId,
                'maxResults' => 50,
            ];

            if ($pageToken !== null) {
                $params['pageToken'] = $pageToken;
            }

            $playlistResponse = $youtube->playlistItems->listPlaylistItems('contentDetails', $params);

            foreach ($playlistResponse->getItems() as $item) {
                $videoIds[] = $item->getContentDetails()->getVideoId();
            }

            $pageToken = $playlistResponse->getNextPageToken();
        } while ($pageToken !== null);

        if (empty($videoIds)) {
            return;
        }

        // Step 3: Batch fetch video details + Data API stats (50 at a time)
        $postDTOs = [];

        foreach (array_chunk($videoIds, 50) as $batch) {
            $videosResponse = $youtube->videos->listVideos('snippet,statistics,contentDetails', [
                'id' => implode(',', $batch),
            ]);

            foreach ($videosResponse->getItems() as $video) {
                $postDTOs[$video->getId()] = YoutubePostDTO::fromVideo($video);
            }
        }

        // Step 4: Batch fetch Analytics API metrics (200 at a time)
        $analytics = new YouTubeAnalytics($this->googleClient);
        $analyticsMetrics = implode(',', YoutubePostInsightDTO::getAnalyticsMetrics());

        foreach (array_chunk($videoIds, 200) as $batch) {
            $analyticsResponse = $analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => '2000-01-01',
                'endDate' => (new \DateTimeImmutable())->format('Y-m-d'),
                'metrics' => $analyticsMetrics,
                'dimensions' => 'video',
                'filters' => 'video==' . implode(',', $batch),
            ]);

            $columnHeaders = $analyticsResponse->getColumnHeaders();
            $rows = $analyticsResponse->getRows();

            if (empty($rows) || empty($columnHeaders)) {
                continue;
            }

            foreach ($rows as $row) {
                $videoId = $row[0];

                if (!isset($postDTOs[$videoId])) {
                    continue;
                }

                foreach ($columnHeaders as $index => $header) {
                    $metricName = $header->getName();

                    if ($metricName === 'video') {
                        continue;
                    }

                    $value = (int) ($row[$index] ?? 0);

                    // Convert estimatedMinutesWatched from minutes to seconds
                    if ($metricName === 'estimatedMinutesWatched') {
                        $value = $value * 60;
                    }

                    $type = YoutubePostInsightDTO::getMetricMapping()[$metricName] ?? null;
                    $postDTOs[$videoId]->addPostInsight(new YoutubePostInsightDTO(type: $type, value: $value));
                }
            }
        }

        // Step 5: Process all posts and their insights
        foreach ($postDTOs as $postDTO) {
            $this->processYoutubePostData($integration, $postDTO);
        }

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

        // 8. Build ranking (current post + up to 9 previous posts)
        $rankingPosts = array_slice($previousPosts, 0, 9);
        $ranking = $this->buildRanking($post, $latestInsightsByType, $rankingPosts);

        return new ShowSocialAnalyticsPostInsightDetailResponseDTO(
            post: $post,
            insightsWithEvolution: $insightsWithEvolution,
            engagementByFollowers: InsightHelper::calculateEngagement($totalInteractions, $totalFollowers),
            engagementByReach: InsightHelper::calculateEngagement($totalInteractions, $reach),
            timelines: $timelines,
            ranking: $ranking,
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

            $filledPoints = TimelineGapFillerHelper::fillPostInsightTimelinePointsHourlyGaps($points);

            $timelines[] = new SocialAnalyticsPostInsightTimelineDTO(
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

    /**
     * @param SocialAnalyticsPostInsight[] $currentPostInsights
     * @param SocialAnalyticsPost[] $previousPosts
     * @return SocialAnalyticsPostRankingItemDTO[]
     */
    private function buildRanking(
        SocialAnalyticsPost $currentPost,
        array $currentPostInsights,
        array $previousPosts,
    ): array {
        // Fetch latest insights per type for all previous posts in one query
        $previousPostIds = array_map(fn(SocialAnalyticsPost $p) => $p->getId(), $previousPosts);
        $allPreviousInsights = $this->postInsightRepository->getLatestByPostIdsGroupedByPostAndType($previousPostIds);

        // Group previous insights by post ID
        $insightsByPostId = [];
        foreach ($allPreviousInsights as $insight) {
            $postId = $insight->getSocialAnalyticsPost()->getId();
            $insightsByPostId[$postId][] = $insight;
        }

        // Calculate score for the current post
        $items = [];
        $items[] = new SocialAnalyticsPostRankingItemDTO(
            post: $currentPost,
            score: $this->calculateRankingScore($currentPostInsights),
        );

        // Calculate score for each previous post
        foreach ($previousPosts as $prevPost) {
            $insights = $insightsByPostId[$prevPost->getId()] ?? [];
            $items[] = new SocialAnalyticsPostRankingItemDTO(
                post: $prevPost,
                score: $this->calculateRankingScore($insights),
            );
        }

        // Sort descending by score
        usort($items, fn(SocialAnalyticsPostRankingItemDTO $a, SocialAnalyticsPostRankingItemDTO $b) => $b->getScore() <=> $a->getScore());

        return $items;
    }

    /**
     * @param SocialAnalyticsPostInsight[] $insights
     */
    private function calculateRankingScore(array $insights): float
    {
        $score = 0.0;

        foreach (self::RANKING_WEIGHTS as $typeValue => $weight) {
            $type = SocialAnalyticsPostInsightType::from($typeValue);
            $value = InsightHelper::getInsightValueByType($insights, $type);
            $score += ($value ?? 0) * $weight;
        }

        return round($score, 2);
    }

    private function processPostData(Integration $integration, array $postData): void
    {
        $postDTO = InstagramPostDTO::fromArray($postData);

        $post = $this->postService->createOrGetPost(
            $integration,
            $postDTO
        );

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights(), convertWatchTimeFromMs: true);
    }

    private function processYoutubePostData(Integration $integration, YoutubePostDTO $postDTO): void
    {
        $post = $this->postService->createOrGetYoutubePost($integration, $postDTO);

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    /**
     * @param SocialAnalyticsPost $post
     * @param array<InstagramPostInsightDTO|YoutubePostInsightDTO> $postInsightDTOs
     * @param bool $convertWatchTimeFromMs Whether to convert watch time values from milliseconds to seconds (Instagram)
     */
    private function createPostInsights(SocialAnalyticsPost $post, array $postInsightDTOs, bool $convertWatchTimeFromMs = false): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $value = $postInsightDTO->getValue();

                // Instagram returns watch time in milliseconds, convert to seconds
                if ($convertWatchTimeFromMs && ($postInsightDTO->getType() === SocialAnalyticsPostInsightType::AverageWatchTime || $postInsightDTO->getType() === SocialAnalyticsPostInsightType::TotalWatchTime)) {
                    $value = (int) ($value / 1000);
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

    private function shouldCreateInsight(SocialAnalyticsPost $post, ?SocialAnalyticsPostInsightType $type, int $value): bool
    {
        if ($type === null) {
            return false;
        }

        if ($post->getId() === null) {
            return true;
        }

        return $this->postInsightRepository->getLatestByPostAndByTypeAndByValue(
            post: $post,
            type: $type,
            value: $value
        ) === null;
    }
}
