<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
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
        private readonly SocialAnalyticsIntegrationInsightRepository $integrationInsightRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    public function fetchInstagramProfileInsights(Integration $integration): void
    {
        if ($integration->getProvider() !== IntegrationProvider::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $metrics = implode(',', InstagramIntegrationInsightDTO::getMetricNames(except: ['followers_count']));

        $response = $this->httpClient->request('GET', sprintf('%s/%s/insights', $this->instagramGraphUrl, $integration->getAccountId()), [
            'query' => [
                'metric' => $metrics,
                'period' => 'day',
                'metric_type' => 'total_value',
                'access_token' => $integration->getAccessToken(),
            ],
        ]);

        $followersCountResponse = $this->httpClient->request('GET', sprintf('%s/%s', $this->instagramGraphUrl, $integration->getAccountId()), [
            'query' => [
                'fields' => 'followers_count',
                'access_token' => $integration->getAccessToken(),
            ],
        ]);

        $data = $response->toArray();
        $insightDTOs = [];

        foreach ($data['data'] as $integrationData) {
            $insightDTOs[] = InstagramIntegrationInsightDTO::fromArray($integrationData);
        }

        $insightDTOs[] = (new InstagramIntegrationInsightDTO('followers_count', 'day', $followersCountResponse->toArray()['followers_count']));

        $this->createInsightEntities($integration, $insightDTOs);

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    private function createInsightEntities(Integration $integration, array $insightDTOs): void
    {
        /** @var InstagramIntegrationInsightDTO $dto */
        foreach ($insightDTOs as $dto) {
            $insightType = InstagramIntegrationInsightDTO::getMetricMapping()[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            if ($this->shouldCreateInsight($integration, $insightType, $dto->getValue())) {
                $insight = new SocialAnalyticsIntegrationInsight();
                $insight
                    ->setType($insightType)
                    ->setValue($dto->getValue())
                    ->setIntegration($integration)
                    ->setUser($integration->getUser());

                $this->integrationInsightRepository->save($insight);
            }
        }
    }

    private function shouldCreateInsight(
        Integration $integration,
        SocialAnalyticsIntegrationInsightType $type,
        int $value,
    ): bool {
        return $this->integrationInsightRepository->getLatestByIntegrationAndByTypeAndByValue(
            integration: $integration,
            type: $type,
            value: $value
        ) === null;
    }
}
