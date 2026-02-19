<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostDTO;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubePostInsightDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostInsightRepository;
use Google\Service\YouTube;

class YoutubePostInsightService
{
    public function __construct(
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
     * Enriches post DTOs with insight data from Reporting API reports.
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

            foreach ($metrics as $metricName => $rawValue) {
                $dto = YoutubePostInsightDTO::fromReportingMetric($metricName, $rawValue);

                if ($dto->getType() !== null) {
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
                    ->setValueFormat($postInsightDTO->getType()->getValueFormat())
                    ->setSocialAnalyticsPost($post)
                    ->setUser($post->getUser());

                $this->postInsightRepository->save($insight);
            }
        }
    }

    private function shouldCreateInsight(SocialAnalyticsPost $post, ?SocialAnalyticsPostInsightType $type, float $value): bool
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
