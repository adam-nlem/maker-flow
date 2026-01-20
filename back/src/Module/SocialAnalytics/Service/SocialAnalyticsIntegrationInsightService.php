<?php

namespace App\Module\SocialAnalytics\Service;

use App\DTO\External\Instagram\InstagramInsightDTO;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsIntegrationInsightService
{
    private const INSTAGRAM_GRAPH_URL = 'https://graph.instagram.com';

    private const INSTAGRAM_METRIC_MAPPING = [
        'reach' => SocialAnalyticsIntegrationInsightType::Reach,
        'views' => SocialAnalyticsIntegrationInsightType::Views,
        'follower_count' => SocialAnalyticsIntegrationInsightType::Followers,
        'profile_links_taps' => SocialAnalyticsIntegrationInsightType::ProfileLinksTaps,
        'comments' => SocialAnalyticsIntegrationInsightType::Comments,
        'shares' => SocialAnalyticsIntegrationInsightType::Shares,
        'saves' => SocialAnalyticsIntegrationInsightType::Saves,
        'likes' => SocialAnalyticsIntegrationInsightType::Likes,
    ];

    public function __construct(
        private readonly SocialAnalyticsIntegrationInsightRepository $repository,
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

    private function createInsightEntities(Integration $integration, array $insightDTOs): array
    {
        $insights = [];

        foreach ($insightDTOs as $dto) {
            $insightType = self::INSTAGRAM_METRIC_MAPPING[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            $insight = new SocialAnalyticsIntegrationInsight();
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
