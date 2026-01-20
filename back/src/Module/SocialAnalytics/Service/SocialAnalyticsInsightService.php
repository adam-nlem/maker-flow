<?php

namespace App\Module\SocialAnalytics\Service;

use App\DTO\External\Instagram\InstagramInsightDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsInsightRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsInsightService
{
    private const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

    private const INSTAGRAM_METRIC_MAPPING = [
        'reach' => SocialAnalyticsInsightType::Reach,
        'views' => SocialAnalyticsInsightType::Views,
        'follower_count' => SocialAnalyticsInsightType::Followers,
        'profile_links_taps' => SocialAnalyticsInsightType::ProfileLinksTaps,
        'comments' => SocialAnalyticsInsightType::Comments,
        'shares' => SocialAnalyticsInsightType::Shares,
        'saves' => SocialAnalyticsInsightType::Saves,
        'likes' => SocialAnalyticsInsightType::Likes,
    ];

    public function __construct(
        private readonly SocialAnalyticsInsightRepository $repository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
    ) {}

    /**
     * Fetches today's metrics and stores them in db
     */
    public function fetchInstagramProfileInsights(Integration $integration): array
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $metrics = implode(',', array_keys(self::INSTAGRAM_METRIC_MAPPING));

        $response = $this->httpClient->request('GET', sprintf('%s/%s/insights', self::INSTAGRAM_GRAPH_URL, $integration->getAccountId()), [
            'query' => [
                'metric' => $metrics,
                'period' => 'day',
                'metric_type' => 'total_value',
                'access_token' => $integration->getAccessToken(),
            ],
        ]);

        $insightDTOs = InstagramInsightDTO::fromApiResponse($response->toArray());

        $insights = $this->createInsightEntities($integration, $insightDTOs);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);

        return $insights;
    }

    /**
     * Fetches ALL media insights using nested requests to save API calls.
     * 1000 videos = ~20 API calls (instead of 1000).
     */
    public function fetchInstagramMediaInsights(Integration $integration): array
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);
        $insights = [];

        // 1. Define the Nested Fields
        // We request media data AND the insights for that media in one go.
        // Note: 'views' is the modern unified metric. 
        // If you are on an older API version, use 'impressions' and 'video_views'.
        $insightMetrics = 'reach,total_interactions,saved,views,likes,comments';

        $fields = sprintf(
            'id,media_type,timestamp,permalink,insights.metric(%s)',
            $insightMetrics
        );

        $url = sprintf('%s/%s/media', self::INSTAGRAM_GRAPH_URL, $integration->getAccountId());
        $queryParams = [
            'fields' => $fields,
            'limit' => 50, // Maximize data per call (max is usually 50-100)
            'access_token' => $integration->getAccessToken(),
        ];

        // 2. Loop for Pagination (Cursor-based)
        do {
            $response = $this->httpClient->request('GET', $url, ['query' => $queryParams]);
            $data = $response->toArray();

            // Process the page of media
            if (!empty($data['data'])) {
                foreach ($data['data'] as $mediaItem) {
                    // Extract insights from the nested 'insights' key
                    if (isset($mediaItem['insights']['data'])) {
                        //$mediaInsights = $this->processMediaInsights($integration, $mediaItem);
                        //$insights = array_merge($insights, $mediaInsights);
                    }
                }
            }

            // 3. Handle Pagination: Check if there is a 'next' page
            if (isset($data['paging']['next'])) {
                $url = $data['paging']['next'];
                // When using paging.next, the query params are already inside the URL, 
                // so we clear our manual params array to avoid duplication/errors.
                $queryParams = [];
            } else {
                $url = null;
            }
        } while ($url !== null);

        // $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        // $this->integrationRepository->save($integration, true);

        return $insights;
    }

    /**
     * Helper to map the nested JSON response to your Entity
     */
    private function processMediaInsights(Integration $integration, array $mediaItem): array
    {
        $createdInsights = [];
        $mediaId = $mediaItem['id'];

        // The API returns insights in a 'data' array nested inside the media object
        foreach ($mediaItem['insights']['data'] as $metricData) {

            // Map the API metric name to your Enum
            $metricName = $metricData['name'];
            $insightType = self::INSTAGRAM_METRIC_MAPPING[$metricName] ?? null;

            if (!$insightType) {
                continue;
            }

            // Media insights are "Lifetime" totals, usually returned as values[0]['value']
            // Unlike account insights which have periods (day/week), media stats are absolute.
            $value = $metricData['values'][0]['value'] ?? 0;

            $insight = new SocialAnalyticsInsight();
            $insight
                ->setType($insightType)
                ->setValue($value)
                ->setIntegration($integration)
                ->setUser($integration->getUser());
                //->setExternalMediaId($mediaId) // Important: You need this field in your DB to track WHICH video this is
                //->setMediaCreatedAt(new \DateTimeImmutable($mediaItem['timestamp'])); // Useful for your "Decay" strategy

            $this->repository->save($insight);
            $createdInsights[] = $insight;
        }

        // Flush in batches (e.g., per page) to manage memory, or once at the end.
        $this->repository->getEntityManager()->flush();

        return $createdInsights;
    }

    private function createInsightEntities(Integration $integration, array $insightDTOs): array
    {
        $insights = [];

        foreach ($insightDTOs as $dto) {
            $insightType = self::INSTAGRAM_METRIC_MAPPING[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            $insight = new SocialAnalyticsInsight();
            $insight
                ->setType($insightType)
                ->setValue($dto->getValue())
                ->setIntegration($integration)
                ->setUser($integration->getUser());

            $this->repository->save($insight);
            $insights[] = $insight;
        }

        $this->repository->getEntityManager()->flush();

        return $insights;
    }
}
