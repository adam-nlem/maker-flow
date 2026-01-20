<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsIntegrationInsightService
{
    private string $instagramGraphUrl;

    public function __construct(
        private readonly SocialAnalyticsIntegrationInsightRepository $repository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        // We can't inject this property in the service.yaml like we did for the OAuthService
        // because we need yo limit the parent to children dependence
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    /**
     * Fetches today's metrics and stores them in db
     */
    public function fetchInstagramProfileInsights(Integration $integration): array
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $metrics = implode(',', InstagramIntegrationInsightDTO::getMetricNames());

        $response = $this->httpClient->request('GET', sprintf('%s/%s/insights', $this->instagramGraphUrl, $integration->getAccountId()), [
            'query' => [
                'metric' => $metrics,
                'period' => 'day',
                'metric_type' => 'total_value',
                'access_token' => $integration->getAccessToken(),
            ],
        ]);

        $insightDTOs = InstagramIntegrationInsightDTO::fromApiResponse($response->toArray());

        $insights = $this->createInsightEntities($integration, $insightDTOs);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);

        return $insights;
    }

    private function createInsightEntities(Integration $integration, array $insightDTOs): array
    {
        $insights = [];

        foreach ($insightDTOs as $dto) {
            $insightType = InstagramIntegrationInsightDTO::getMetricNames()[$dto->getName()] ?? null;

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
