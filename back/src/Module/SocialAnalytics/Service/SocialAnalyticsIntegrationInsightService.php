<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\ShowSocialAnalyticsIntegrationDetailResponseDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightDailyPointsDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightWithEvolutionDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Helper\InsightHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use DateInterval;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class SocialAnalyticsIntegrationInsightService
{
    private const GRAPH_INSIGHT_TYPES = [
        SocialAnalyticsIntegrationInsightType::TotalFollowers,
        SocialAnalyticsIntegrationInsightType::Comments,
        SocialAnalyticsIntegrationInsightType::Shares,
        SocialAnalyticsIntegrationInsightType::Saves,
        SocialAnalyticsIntegrationInsightType::Views,
        SocialAnalyticsIntegrationInsightType::Reach,
        SocialAnalyticsIntegrationInsightType::Likes,
    ];

    private string $instagramGraphUrl;

    public function __construct(
        private readonly SocialAnalyticsIntegrationInsightRepository $integrationInsightRepository,
        private readonly SocialAnalyticsPostRepository $postRepository,
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

        // We can't get all the history at once because most of the insights can't be returned as time series
        // This means that the API will always return the total values in the selected since-until time frame
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

    public function getDetail(
        User $user,
        Integration $integration,
        SocialAnalyticsTimePeriod $timePeriod,
    ): ShowSocialAnalyticsIntegrationDetailResponseDTO {
        $now = new \DateTimeImmutable('now', new \DateTimeZone('UTC'));
        $daysCount = $timePeriod->getDaysCount();

        $currentPeriodStart = $now->modify("-{$daysCount} days");
        $currentPeriodEnd = $now;

        $previousPeriodStart = $currentPeriodStart->modify("-{$daysCount} days");
        $previousPeriodEnd = $currentPeriodStart;

        $currentInsights = $this->integrationInsightRepository->getByUserAndIntegrationAndTimePeriod(
            $user,
            $integration,
            $currentPeriodStart,
            $currentPeriodEnd,
        );

        $previousInsights = $this->integrationInsightRepository->getByUserAndIntegrationAndTimePeriod(
            $user,
            $integration,
            $previousPeriodStart,
            $previousPeriodEnd,
        );

        $insightsWithEvolution = $this->buildInsightsWithEvolution($currentInsights, $previousInsights);

        $totalFollowers = InsightHelper::getInsightValueByType($currentInsights, SocialAnalyticsIntegrationInsightType::TotalFollowers) ?? 0;
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        $dailyPoints = $this->buildDailyPoints($user, $integration, $currentPeriodStart);

        return new ShowSocialAnalyticsIntegrationDetailResponseDTO(
            totalFollowers: $totalFollowers,
            postCount: $postCount,
            streak: $streak,
            insights: $insightsWithEvolution,
            dailyPoints: $dailyPoints,
        );
    }

    /**
     * @return SocialAnalyticsIntegrationInsightDailyPointsDTO[]
     */
    private function buildDailyPoints(
        User $user,
        Integration $integration,
        \DateTimeImmutable $periodStart,
    ): array {
        $insights = $this->integrationInsightRepository->getDailyByUserAndIntegrationAndTypes(
            $user,
            $integration,
            self::GRAPH_INSIGHT_TYPES,
            $periodStart,
        );

        $insightsByType = [];
        foreach ($insights as $insight) {
            $typeValue = $insight->getType()->value;
            if (!isset($insightsByType[$typeValue])) {
                $insightsByType[$typeValue] = [];
            }
            $insightsByType[$typeValue][] = $insight;
        }

        $graphs = [];
        foreach (self::GRAPH_INSIGHT_TYPES as $type) {
            $typeInsights = $insightsByType[$type->value] ?? [];

            $graphs[] = new SocialAnalyticsIntegrationInsightDailyPointsDTO(
                type: $type,
                insights: $typeInsights,
            );
        }

        return $graphs;
    }

    /**
     * @param SocialAnalyticsIntegrationInsight[] $currentInsights
     * @param SocialAnalyticsIntegrationInsight[] $previousInsights
     * @return SocialAnalyticsIntegrationInsightWithEvolutionDTO[]
     */
    private function buildInsightsWithEvolution(array $currentInsights, array $previousInsights): array
    {
        $previousByType = InsightEvolutionHelper::buildPreviousValuesByType($previousInsights);

        $insightsWithEvolution = [];
        foreach ($currentInsights as $insight) {
            $type = $insight->getType();
            $currentValue = $insight->getValue();
            $previousValue = $previousByType[$type->value] ?? null;

            $evolutionPercentage = InsightEvolutionHelper::calculateEvolutionPercentage($currentValue, $previousValue);

            $insightsWithEvolution[] = new SocialAnalyticsIntegrationInsightWithEvolutionDTO(
                type: $type,
                value: $currentValue,
                evolutionPercentage: $evolutionPercentage,
            );
        }

        return $insightsWithEvolution;
    }
}
