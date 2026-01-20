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

    public function fetchInstagramProfileInsights(Integration $integration): array
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $insightDTOs = $this->fetchInsightsFromApi(
            $integration->getAccessToken(),
            $integration->getAccountId()
        );

        $insights = $this->createInsightEntities($integration, $insightDTOs);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);

        return $insights;
    }

    private function fetchInsightsFromApi(string $accessToken, string $userId): array
    {
        $metrics = implode(',', array_keys(self::INSTAGRAM_METRIC_MAPPING));

        $response = $this->httpClient->request('GET', self::INSTAGRAM_GRAPH_URL . '/' . $userId . '/insights', [
            'query' => [
                'metric' => $metrics,
                'period' => 'lifetime',
                'access_token' => $accessToken,
            ],
        ]);

        return InstagramInsightDTO::fromApiResponse($response->toArray());
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
