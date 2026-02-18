<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostDTO;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostInsightDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use Google\Client;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;

class YoutubePostInsightService
{
    public function __construct(
        private readonly Client $googleClient,
        private readonly SocialAnalyticsPostService $postService,
        private readonly SocialAnalyticsPostInsightRepository $postInsightRepository,
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
            $videosResponse = $youtube->videos->listVideos('snippet,contentDetails', [
                'id' => implode(',', $batch),
            ]);

            foreach ($videosResponse->getItems() as $video) {
                $postDTOs[$video->getId()] = YoutubePostDTO::fromVideo($video);
            }
        }

        return $postDTOs;
    }

    /**
     * @param array<string, YoutubePostDTO> $postDTOs
     * @param string[] $videoIds
     */
    public function enrichPostDTOsWithAnalytics(array $postDTOs, array $videoIds): void
    {
        $analytics = new YouTubeAnalytics($this->googleClient);
        $videoAnalyticsMetrics = implode(',', YoutubePostInsightDTO::getVideoMetricNames());
        $reachAnalyticsMetrics = implode(',', YoutubePostInsightDTO::getReachMetricNames());

        $endDate = DateHelper::createUtcDateTimeImmutable();
        $startDate = $endDate->modify("-1 day");
        foreach (array_chunk($videoIds, 200) as $batch) {
            $videoAnalyticsResponse = $analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => $videoAnalyticsMetrics,
                'dimensions' => 'video',
                'filters' => 'video==' . implode(',', $batch),
            ]);

            $reachAnalyticsResponse = $analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate->format('Y-m-d'),
                'endDate' => $endDate->format('Y-m-d'),
                'metrics' => $reachAnalyticsMetrics,
                'dimensions' => 'video_id',
                'filters' => 'video==' . implode(',', $batch),
            ]);

            dd($reachAnalyticsResponse);
            $columnHeaders = $videoAnalyticsResponse->getColumnHeaders();
            $rows = $videoAnalyticsResponse->getRows();

            if (empty($rows) || empty($columnHeaders)) {
                continue;
            }

            $videoColumnIndex = null;
            $dimensionColumns = [];

            foreach ($columnHeaders as $index => $header) {
                if ($header->getColumnType() === 'DIMENSION') {
                    $dimensionColumns[] = $index;

                    if ($header->getName() === 'video') {
                        $videoColumnIndex = $index;
                    }
                }
            }

            if ($videoColumnIndex === null) {
                continue;
            }

            foreach ($rows as $row) {
                $videoId = $row[$videoColumnIndex];

                if (!isset($postDTOs[$videoId])) {
                    continue;
                }

                foreach ($columnHeaders as $index => $header) {
                    if (in_array($index, $dimensionColumns, true)) {
                        continue;
                    }

                    $postDTOs[$videoId]->addPostInsight(
                        YoutubePostInsightDTO::fromAnalyticsMetric($header->getName(), (int) ($row[$index] ?? 0))
                    );
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
    private function createPostInsights(SocialAnalyticsPost $post, array $postInsightDTOs): void
    {
        foreach ($postInsightDTOs as $postInsightDTO) {
            if ($postInsightDTO->getType() === null) {
                continue;
            }

            if ($this->shouldCreateInsight(post: $post, type: $postInsightDTO->getType(), value: $postInsightDTO->getValue())) {
                $insight = new SocialAnalyticsPostInsight();
                $insight
                    ->setType($postInsightDTO->getType())
                    ->setValue($postInsightDTO->getValue())
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
