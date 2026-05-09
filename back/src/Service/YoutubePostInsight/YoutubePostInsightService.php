<?php

namespace App\Service\YoutubePostInsight;

use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Service\Post\PostService;
use App\DTO\External\Youtube\YoutubePostDTO;
use App\DTO\External\Youtube\YoutubePostInsightDTO;
use App\Entity\Enum\PostInsightType;
use App\Entity\Post;
use App\Entity\PostInsight;
use App\Repository\PostInsightRepository;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;

class YoutubePostInsightService
{
    public function __construct(
        private readonly PostService $postService,
        private readonly PostInsightRepository $postInsightRepository,
    ) {}

    public function getUploadsPlaylistId(YouTube $youtube): ?string
    {
        $channelResponse = $youtube->channels->listChannels('contentDetails', ['mine' => true]);
        $channels = $channelResponse->getItems();

        if (empty($channels)) {
            return null;
        }

        return $channels[0]->getContentDetails()->getRelatedPlaylists()->getUploads();
    }

    /**
     * @return string[]
     */
    public function fetchVideoIds(YouTube $youtube, string $uploadsPlaylistId): array
    {
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

        return $videoIds;
    }

    /**
     * @param string[] $videoIds
     * @return array<string, YoutubePostDTO>
     */
    public function buildPostDTOs(YouTube $youtube, array $videoIds): array
    {
        $postDTOs = [];

        foreach (array_chunk($videoIds, 50) as $batch) {
            $videosResponse = $youtube->videos->listVideos('snippet,contentDetails,statistics', [
                'id' => implode(',', $batch),
            ]);

            foreach ($videosResponse->getItems() as $video) {
                $postDTO = YoutubePostDTO::fromVideo($video);

                $statistics = $video->getStatistics();
                if ($statistics !== null) {
                    $statisticsData = [
                        'viewCount' => (float) ($statistics->getViewCount() ?? 0),
                        'likeCount' => (float) ($statistics->getLikeCount() ?? 0),
                        'commentCount' => (float) ($statistics->getCommentCount() ?? 0),
                    ];

                    foreach ($statisticsData as $name => $value) {
                        $insightDTO = YoutubePostInsightDTO::fromDataApiStatistic($name, $value);
                        if ($insightDTO->getType() !== null) {
                            $postDTO->addPostInsight($insightDTO);
                        }
                    }
                }

                $postDTOs[$video->getId()] = $postDTO;
            }
        }

        return $postDTOs;
    }

    /**
     * Fetches lifetime per-video metrics from the YouTube Analytics API.
     * Uses dimensions=video to get aggregated totals in paginated calls (200 videos per page).
     *
     * @param array<string, YoutubePostDTO> $postDTOs
     */
    public function fetchAnalyticsInsights(YouTubeAnalytics $analytics, array $postDTOs): void
    {
        $metrics = implode(',', YoutubePostInsightDTO::getAnalyticsMetrics());
        $endDate = DateHelper::createUtcDateTimeImmutable()->format('Y-m-d');
        $startIndex = 1;
        $maxResults = 200;

        do {
            $response = $analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => '2005-01-01',
                'endDate' => $endDate,
                'dimensions' => 'video',
                'metrics' => $metrics,
                'maxResults' => $maxResults,
                'startIndex' => $startIndex,
                'sort' => '-estimatedMinutesWatched',
            ]);

            $columnHeaders = $response->getColumnHeaders();
            $rows = $response->getRows();

            if (empty($rows) || empty($columnHeaders)) {
                break;
            }

            foreach ($rows as $row) {
                $videoId = $row[0]; // First column is the video dimension

                if (!isset($postDTOs[$videoId])) {
                    continue;
                }

                // Start at index 1 to skip the video dimension column
                for ($i = 1, $count = count($columnHeaders); $i < $count; $i++) {
                    $metricName = $columnHeaders[$i]->getName();
                    $value = (float) ($row[$i] ?? 0);

                    $insightDTO = YoutubePostInsightDTO::fromAnalyticsMetric($metricName, $value);
                    if ($insightDTO->getType() !== null) {
                        $postDTOs[$videoId]->addPostInsight($insightDTO);
                    }
                }
            }

            $startIndex += $maxResults;
        } while (count($rows) === $maxResults);
    }

    /**
     * Enriches post DTOs with insight data from Reporting API reports.
     * Skips metrics already populated by the Data API or Analytics API.
     *
     * @param array<string, YoutubePostDTO> $postDTOs
     * @param array<string, array<string, float>> $aggregatedData Aggregated metrics per video_id from basic report
     */
    public function enrichPostDTOsFromReports(array $postDTOs, array $aggregatedData): void
    {
        foreach ($aggregatedData as $videoId => $metrics) {
            if (!isset($postDTOs[$videoId])) {
                continue;
            }

            $existingTypes = array_map(
                fn(YoutubePostInsightDTO $dto) => $dto->getType(),
                $postDTOs[$videoId]->getPostInsights(),
            );

            foreach ($metrics as $metricName => $rawValue) {
                $dto = YoutubePostInsightDTO::fromReportingMetric($metricName, $rawValue);

                if ($dto->getType() !== null && !in_array($dto->getType(), $existingTypes, true)) {
                    $postDTOs[$videoId]->addPostInsight($dto);
                }
            }
        }
    }

    public function processPostData(Integration $integration, YoutubePostDTO $postDTO): void
    {
        $post = $this->postService->createOrGetYoutubePost($integration, $postDTO);

        $this->createPostInsights(post: $post, postInsightDTOs: $postDTO->getPostInsights());
    }

    /**
     * @param YoutubePostInsightDTO[] $postInsightDTOs
     */
    private function createPostInsights(Post $post, array $postInsightDTOs): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $insight = new PostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($postInsightDTO->getValue())
                    ->setValueFormat($postInsightDTO->getType()->getValueFormat())
                    ->setPost($post);

                $this->postInsightRepository->save($insight);
            }
        }
    }

    private function shouldCreateInsight(Post $post, ?PostInsightType $type, float $value): bool
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
