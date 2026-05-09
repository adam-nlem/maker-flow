<?php

namespace App\Service\IntegrationInsight;

use App\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\DTO\External\Tiktok\TiktokIntegrationInsightDTO;
use App\DTO\External\Youtube\YoutubeIntegrationInsightDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightsOverviewDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightsViewsTimelineDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightsViewsTimelinePointDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightTimelineDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightTimelinePointDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightWithEvolutionDTO;
use App\DTO\Response\IntegrationInsight\ListIntegrationInsightsGroupedByIntegrationResponseDTO;
use App\DTO\Response\IntegrationInsight\ListIntegrationInsightsResponseDTO;
use App\DTO\Response\IntegrationInsight\ShowIntegrationDetailResponseDTO;
use App\Entity\Enum\IntegrationInsightType;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Enum\Platform;
use App\Entity\Enum\PostInsightType;
use App\Entity\Enum\TimePeriod;
use App\Entity\Integration;
use App\Entity\IntegrationInsight;
use App\Entity\Project;
use App\Exception\Integration\OAuthTokenRevokedException;
use App\Helper\DateHelper;
use App\Helper\InsightEvolutionHelper;
use App\Helper\InsightHelper;
use App\Helper\TimelineGapFillerHelper;
use App\Repository\IntegrationInsightRepository;
use App\Repository\IntegrationRepository;
use App\Repository\PostInsightRepository;
use App\Repository\PostRepository;
use App\Repository\YoutubeReportingJobRepository;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\TiktokOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use Google\Client;
use Google\Service\Exception;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;
use Symfony\Contracts\HttpClient\Exception\ClientExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

class IntegrationInsightService
{
    private const GRAPH_INSIGHT_TYPES = [
        IntegrationInsightType::TotalFollowers,
        IntegrationInsightType::Comments,
        IntegrationInsightType::Shares,
        IntegrationInsightType::Saves,
        IntegrationInsightType::Views,
        IntegrationInsightType::Reach,
        IntegrationInsightType::Likes,
    ];

    private const OVERVIEW_POST_INSIGHT_TYPES = [
        PostInsightType::Views,
        PostInsightType::Likes,
        PostInsightType::Comments,
        PostInsightType::Shares,
        PostInsightType::Saves,
        PostInsightType::Reach,
    ];

    private const GROUP_GROWTH_INSIGHT_TYPES = [
        IntegrationInsightType::Views,
        IntegrationInsightType::Likes,
        IntegrationInsightType::Comments,
        IntegrationInsightType::Shares,
        IntegrationInsightType::Saves,
        IntegrationInsightType::Reach,
    ];

    private string $instagramGraphUrl;
    private string $tiktokApiUrl;

    public function __construct(
        private readonly IntegrationInsightRepository $integrationInsightRepository,
        private readonly PostInsightRepository $postInsightRepository,
        private readonly PostRepository $postRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly TiktokOAuthService $tiktokOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
        private readonly Client $googleClient,
        private readonly YoutubeOAuthService $youtubeOAuthService,
        private readonly YoutubeReportingJobRepository $youtubeReportingJobRepository,
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
        $this->tiktokApiUrl = $this->parameterBag->get('app.tiktok.api_url');
    }

    public function list(
        Project $project,
        TimePeriod $timePeriod,
    ): ListIntegrationInsightsResponseDTO {
        $bounds = $this->computePeriodBounds($timePeriod);

        $integrations = $this->integrationRepository->getByProject($project);

        $groups = $this->buildGroups($project, $integrations, $bounds['currentStart'], $bounds['currentEnd']);
        $overview = $this->buildOverview($project, $bounds['currentStart'], $bounds['currentEnd'], $bounds['previousStart'], $bounds['previousEnd']);
        $viewsTimeline = $this->buildViewsTimeline($project, $bounds['currentStart'], $bounds['currentEnd']);

        return new ListIntegrationInsightsResponseDTO(
            groups: $groups,
            overview: $overview,
            viewsTimeline: $viewsTimeline,
        );
    }

    public function fetchInstagramProfileInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $metrics = implode(',', InstagramIntegrationInsightDTO::getMetricNames(except: ['followers_count']));

        try {
            $response = $this->httpClient->request('GET', sprintf('%s/%s', $this->instagramGraphUrl, $integration->getAccountId()), [
                'query' => [
                    'fields' => sprintf('followers_count,profile_picture_url,insights.metric(%s).period(day).metric_type(total_value)', $metrics),
                    'access_token' => $integration->getAccessToken(),
                ],
            ]);

            $data = $response->toArray();
        } catch (\Exception $e) {
            $this->throwIfOAuthAuthError($e, $integration);

            throw $e;
        }

        if (isset($data['profile_picture_url'])) {
            $integration->setProfilePictureUrl($data['profile_picture_url']);
        }

        $insightDTOs = [];
        if (isset($data['insights']['data'])) {
            foreach ($data['insights']['data'] as $integrationData) {
                $insightDTOs[] = InstagramIntegrationInsightDTO::fromArray($integrationData);
            }
        }

        if (isset($data['followers_count'])) {
            $insightDTOs[] = new InstagramIntegrationInsightDTO('followers_count', 'day', (float) $data['followers_count']);
        }

        $this->createInsightEntitiesFromDTOs($integration, $insightDTOs, InstagramIntegrationInsightDTO::getMetricMapping());

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    public function fetchYoutubeProfileInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Youtube) {
            throw new \InvalidArgumentException('Integration must be a YouTube integration');
        }

        $this->youtubeOAuthService->configureGoogleClient();
        $integration = $this->youtubeOAuthService->refreshTokenIfNeeded($integration);

        $this->googleClient->setAccessToken($integration->getAccessToken());

        try {
            $youtube = new YouTube($this->googleClient);
            $channelResponse = $youtube->channels->listChannels('statistics', ['mine' => true]);
            $channels = $channelResponse->getItems();
            $insightDTOs = [];

            if (!empty($channels)) {
                $statistics = $channels[0]->getStatistics();
                $subscriberCount = (float) $statistics->getSubscriberCount();
                $insightDTOs[] = new YoutubeIntegrationInsightDTO('subscriberCount', $subscriberCount);
            }

            $analytics = new YouTubeAnalytics($this->googleClient);
            $now = DateHelper::createUtcDateTimeImmutable();
            $startDate = $now->modify('-1 month')->format('Y-m-d');
            $endDate = $now->format('Y-m-d');

            $metrics = implode(',', YoutubeIntegrationInsightDTO::getAnalyticsMetrics());
            $analyticsResponse = $analytics->reports->query([
                'ids' => 'channel==MINE',
                'startDate' => $startDate,
                'endDate' => $endDate,
                'metrics' => $metrics,
            ]);
            $columnHeaders = $analyticsResponse->getColumnHeaders();
            $rows = $analyticsResponse->getRows();

            if (!empty($rows) && !empty($columnHeaders)) {
                $row = $rows[0];
                foreach ($columnHeaders as $index => $header) {
                    $metricName = $header->getName();
                    $value = (float) ($row[$index] ?? 0);
                    $insightDTOs[] = new YoutubeIntegrationInsightDTO($metricName, $value);
                }
            }
        } catch (\Exception $e) {
            $this->throwIfOAuthAuthError($e, $integration);

            throw $e;
        }

        $this->createInsightEntitiesFromDTOs($integration, $insightDTOs, YoutubeIntegrationInsightDTO::getMetricMapping());

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    public function fetchTiktokProfileInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Tiktok) {
            throw new \InvalidArgumentException('Integration must be a TikTok integration');
        }

        $integration = $this->tiktokOAuthService->refreshTokenIfNeeded($integration);

        $fields = implode(',', [...TiktokIntegrationInsightDTO::getMetricNames(), 'avatar_url']);

        try {
            $response = $this->httpClient->request('GET', sprintf('%s/v2/user/info/', $this->tiktokApiUrl), [
                'headers' => [
                    'Authorization' => sprintf('Bearer %s', $integration->getAccessToken()),
                ],
                'query' => [
                    'fields' => $fields,
                ],
            ]);

            $data = $response->toArray();
        } catch (\Exception $e) {
            $this->throwIfOAuthAuthError($e, $integration);

            throw $e;
        }

        $user = $data['data']['user'] ?? [];

        if (isset($user['avatar_url'])) {
            $integration->setProfilePictureUrl($user['avatar_url']);
        }

        $insightDTOs = [];
        foreach (TiktokIntegrationInsightDTO::getMetricNames() as $fieldName) {
            if (isset($user[$fieldName])) {
                $insightDTOs[] = new TiktokIntegrationInsightDTO($fieldName, (float) $user[$fieldName]);
            }
        }

        $this->createInsightEntitiesFromDTOs($integration, $insightDTOs, TiktokIntegrationInsightDTO::getMetricMapping());

        $integration->setLastSyncedAt(DateHelper::createUtcDateTimeImmutable());
        $this->integrationRepository->save($integration, true);
    }

    /**
     * @param Integration[] $integrations
     * @return ListIntegrationInsightsGroupedByIntegrationResponseDTO[]
     */
    private function buildGroups(
        Project $project,
        array $integrations,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $perIntegrationGrowths = $this->postInsightRepository->getGrowthByProjectAndTypesInPeriodGroupedByIntegration(
            $project, self::OVERVIEW_POST_INSIGHT_TYPES, $startDate, $endDate,
        );

        $growthsByIntegration = [];
        foreach ($perIntegrationGrowths as $row) {
            $growthsByIntegration[$row['integrationId']][$row['type']] = (float) $row['totalGrowth'];
        }

        $followersByIntegrationId = $this->integrationInsightRepository
            ->getLatestTotalFollowersByProjectGroupedByIntegration($project);

        $groups = [];
        foreach ($integrations as $integration) {
            $growths = $growthsByIntegration[$integration->getId()] ?? [];
            $followers = $followersByIntegrationId[$integration->getId()] ?? 0.0;

            $insights = [
                new IntegrationInsightWithEvolutionDTO(
                    type: IntegrationInsightType::TotalFollowers,
                    value: $followers,
                    evolutionPercentage: null,
                ),
            ];

            foreach (self::GROUP_GROWTH_INSIGHT_TYPES as $type) {
                $insights[] = new IntegrationInsightWithEvolutionDTO(
                    type: $type,
                    value: $growths[$type->value] ?? 0.0,
                    evolutionPercentage: null,
                );
            }

            $groups[] = new ListIntegrationInsightsGroupedByIntegrationResponseDTO(
                integration: $integration,
                insights: $insights,
            );
        }

        return $groups;
    }

    private function buildOverview(
        Project $project,
        \DateTimeImmutable $currentStart,
        \DateTimeImmutable $currentEnd,
        \DateTimeImmutable $previousStart,
        \DateTimeImmutable $previousEnd,
    ): IntegrationInsightsOverviewDTO {
        $currentSums = $this->postInsightRepository->getGrowthByProjectAndTypesInPeriod(
            $project, self::OVERVIEW_POST_INSIGHT_TYPES, $currentStart, $currentEnd,
        );

        $previousSums = $this->postInsightRepository->getGrowthByProjectAndTypesInPeriod(
            $project, self::OVERVIEW_POST_INSIGHT_TYPES, $previousStart, $previousEnd,
        );

        $currentFollowers = $this->integrationInsightRepository->getAggregatedTotalFollowersByProjectBeforeDate(
            $project, $currentEnd,
        ) ?? 0.0;

        $previousFollowers = $this->integrationInsightRepository->getAggregatedTotalFollowersByProjectBeforeDate(
            $project, $currentStart,
        ) ?? 0.0;

        $currentByType = $this->buildGrowthByType($currentSums);
        $previousByType = $this->buildGrowthByType($previousSums);

        $currentViews = $currentByType[PostInsightType::Views->value] ?? 0.0;
        $previousViews = $previousByType[PostInsightType::Views->value] ?? 0.0;

        $currentReach = $currentByType[PostInsightType::Reach->value] ?? 0.0;
        $previousReach = $previousByType[PostInsightType::Reach->value] ?? 0.0;

        $currentInteractions = $this->sumInteractions($currentByType);
        $previousInteractions = $this->sumInteractions($previousByType);

        $currentEngagement = InsightHelper::calculateEngagement($currentInteractions, $currentViews);
        $previousEngagement = InsightHelper::calculateEngagement($previousInteractions, $previousViews);

        return new IntegrationInsightsOverviewDTO(
            totalFollowers: $currentFollowers,
            totalFollowersEvolution: InsightEvolutionHelper::calculateAbsoluteEvolution($currentFollowers, $previousFollowers),
            totalViews: $currentViews,
            totalViewsEvolution: InsightEvolutionHelper::calculateEvolutionPercentage($currentViews, $previousViews),
            engagementRate: $currentEngagement,
            engagementRateEvolution: InsightEvolutionHelper::calculateEvolutionPoints($currentEngagement, $previousEngagement),
            totalReach: $currentReach,
            totalReachEvolution: InsightEvolutionHelper::calculateEvolutionPercentage($currentReach, $previousReach),
        );
    }

    /**
     * @return IntegrationInsightsViewsTimelineDTO[]
     */
    private function buildViewsTimeline(
        Project $project,
        \DateTimeImmutable $startDate,
        \DateTimeImmutable $endDate,
    ): array {
        $rows = $this->postInsightRepository->getDailyGrowthByProjectAndTypeInPeriod(
            $project, PostInsightType::Views, $startDate, $endDate,
        );

        $pointsByPlatform = [];
        foreach ($rows as $row) {
            $pointsByPlatform[$row['platform']][] = new IntegrationInsightsViewsTimelinePointDTO(
                date: $row['date'],
                value: (float) $row['value'],
            );
        }

        $timelines = [];
        foreach ($pointsByPlatform as $platform => $points) {
            $timelines[] = new IntegrationInsightsViewsTimelineDTO(
                platform: Platform::from($platform),
                points: TimelineGapFillerHelper::fillIntegrationInsightsViewsTimelinePointsDailyGaps(
                    $points, $startDate, $endDate,
                ),
            );
        }

        return $timelines;
    }

    /**
     * @param IntegrationInsight[] $currentInsights
     * @param IntegrationInsight[] $previousInsights
     * @return IntegrationInsightWithEvolutionDTO[]
     */
    private function buildInsightsWithEvolution(array $currentInsights, array $previousInsights): array
    {
        $previousByType = InsightEvolutionHelper::buildPreviousValuesByType($previousInsights);

        $insightsWithEvolution = [];
        foreach ($currentInsights as $insight) {
            $type = $insight->getType();
            $currentValue = $insight->getValue();
            $previousValue = $previousByType[$type->value] ?? null;

            $insightsWithEvolution[] = new IntegrationInsightWithEvolutionDTO(
                type: $type,
                value: $currentValue,
                evolutionPercentage: InsightEvolutionHelper::calculateEvolutionPercentage($currentValue, $previousValue),
            );
        }

        return $insightsWithEvolution;
    }


    private function isYoutubeReportPending(Integration $integration): ?bool
    {
        if ($integration->getPlatform() !== Platform::Youtube) {
            return null;
        }

        $jobs = $this->youtubeReportingJobRepository->getByIntegration($integration);

        if (empty($jobs)) {
            return true;
        }

        foreach ($jobs as $job) {
            if ($job->getLastProcessedReportDate() === null) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array{currentStart: \DateTimeImmutable, currentEnd: \DateTimeImmutable, previousStart: \DateTimeImmutable, previousEnd: \DateTimeImmutable}
     */
    private function computePeriodBounds(TimePeriod $timePeriod): array
    {
        $now = DateHelper::createUtcDateTimeImmutable();
        $daysCount = $timePeriod->getDaysCount();

        $currentStart = $now->modify("-{$daysCount} days");
        $previousStart = $currentStart->modify("-{$daysCount} days");

        return [
            'currentStart' => $currentStart,
            'currentEnd' => $now,
            'previousStart' => $previousStart,
            'previousEnd' => $currentStart,
        ];
    }

    /**
     * @param array<string, float> $growthByType
     */
    private function sumInteractions(array $growthByType): float
    {
        return ($growthByType[PostInsightType::Likes->value] ?? 0.0)
            + ($growthByType[PostInsightType::Comments->value] ?? 0.0)
            + ($growthByType[PostInsightType::Shares->value] ?? 0.0)
            + ($growthByType[PostInsightType::Saves->value] ?? 0.0);
    }

    /**
     * @param array<array{type: string, totalGrowth: float|string}> $growths
     * @return array<string, float>
     */
    private function buildGrowthByType(array $growths): array
    {
        $byType = [];
        foreach ($growths as $row) {
            $byType[$row['type']] = (float) $row['totalGrowth'];
        }

        return $byType;
    }

    /**
     * @param array<InstagramIntegrationInsightDTO|YoutubeIntegrationInsightDTO|TiktokIntegrationInsightDTO> $insightDTOs
     * @param array<string, IntegrationInsightType> $metricMapping
     */
    private function createInsightEntitiesFromDTOs(Integration $integration, array $insightDTOs, array $metricMapping): void
    {
        foreach ($insightDTOs as $dto) {
            $insightType = $metricMapping[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            if (!$this->shouldCreateInsight($integration, $insightType, $dto->getValue())) {
                continue;
            }

            $insight = new IntegrationInsight();
            $insight
                ->setType($insightType)
                ->setValue($dto->getValue())
                ->setValueFormat($insightType->getValueFormat())
                ->setIntegration($integration)
                ->setUser($integration->getCreatedBy());

            $this->integrationInsightRepository->save($insight);
        }
    }

    private function shouldCreateInsight(
        Integration $integration,
        IntegrationInsightType $type,
        float $value,
    ): bool {
        return $this->integrationInsightRepository->getLatestByIntegrationAndByTypeAndByValue(
            integration: $integration,
            type: $type,
            value: $value,
        ) === null;
    }

    /**
     * @throws OAuthTokenRevokedException
     */
    private function throwIfOAuthAuthError(\Exception $e, Integration $integration): void
    {
        $isAuthError = match (true) {
            $e instanceof ClientExceptionInterface => in_array($e->getResponse()->getStatusCode(), [401, 403], true),
            $e instanceof Exception => in_array($e->getCode(), [401, 403], true),
            default => false,
        };

        if ($isAuthError) {
            $integration->setStatus(IntegrationStatus::Revoked);
            $this->integrationRepository->save($integration, true);

            throw new OAuthTokenRevokedException($integration->getUuid());
        }
    }
}
