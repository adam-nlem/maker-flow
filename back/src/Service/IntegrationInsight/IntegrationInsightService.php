<?php

namespace App\Service\IntegrationInsight;

use App\Entity\Enum\Platform;
use App\Entity\Integration;
use App\Entity\Project;
use App\Entity\User;
use App\Helper\DateHelper;
use App\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\DTO\External\Youtube\YoutubeIntegrationInsightDTO;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use App\DTO\Response\IntegrationInsight\ListIntegrationInsightsGroupedByIntegrationResponseDTO;
use App\DTO\Response\IntegrationInsight\ListIntegrationInsightsResponseDTO;
use App\DTO\Response\IntegrationInsight\ShowIntegrationDetailResponseDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightTimelineDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightTimelinePointDTO;
use App\DTO\Response\IntegrationInsight\IntegrationInsightWithEvolutionDTO;
use App\Entity\Enum\IntegrationStatus;
use App\Entity\Enum\IntegrationInsightType;
use App\Entity\Enum\TimePeriod;
use App\Entity\IntegrationInsight;
use App\Helper\InsightEvolutionHelper;
use App\Helper\InsightHelper;
use App\Helper\TimelineGapFillerHelper;
use App\Repository\IntegrationInsightRepository;
use App\Repository\PostRepository;
use App\Repository\YoutubeReportingJobRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\Exception\OAuthTokenRevokedException;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use Google\Client;
use Google\Service\Exception;
use Psr\Log\LoggerInterface;
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

    private string $instagramGraphUrl;

    public function __construct(
        private readonly IntegrationInsightRepository $integrationInsightRepository,
        private readonly PostRepository $postRepository,
        private readonly IntegrationRepository $integrationRepository,
        private readonly InstagramOAuthService $instagramOAuthService,
        private readonly HttpClientInterface $httpClient,
        private readonly ParameterBagInterface $parameterBag,
        private readonly Client $googleClient,
        private readonly YoutubeOAuthService $youtubeOAuthService,
        private readonly YoutubeReportingJobRepository $youtubeReportingJobRepository,
        private LoggerInterface $log
    ) {
        $this->instagramGraphUrl = $this->parameterBag->get('app.instagram.graph_url');
    }

    public function list(User $user, Project $project, bool $isSubscribed = true): ListIntegrationInsightsResponseDTO
    {
        $integrations = $this->integrationRepository->getByProjectAndUser($project, $user);

        $groups = array_map(
            fn(Integration $integration) => new ListIntegrationInsightsGroupedByIntegrationResponseDTO(
                integration: $integration,
                insights: $this->integrationInsightRepository->getLatestByUserAndByIntegration($user, $integration),
            ),
            $integrations,
        );

        $aggregatedInsights = [];
        if ($isSubscribed) {
            foreach ($this->integrationInsightRepository->getAggregatedLatestByProjectAndUser($project, $user) as $row) {
                $type = $row['type'] instanceof IntegrationInsightType ? $row['type']->value : $row['type'];
                $aggregatedInsights[] = ['type' => $type, 'value' => (float) $row['totalValue']];
            }
        }

        return new ListIntegrationInsightsResponseDTO(
            groups: $groups,
            aggregatedInsights: $aggregatedInsights,
        );
    }

    public function fetchInstagramProfileInsights(Integration $integration): void
    {
        if ($integration->getPlatform() !== Platform::Instagram) {
            throw new \InvalidArgumentException('Integration must be an Instagram integration');
        }

        $integration = $this->instagramOAuthService->refreshTokenIfNeeded($integration);

        $metrics = implode(',', InstagramIntegrationInsightDTO::getMetricNames(except: ['followers_count']));

        // Single API call with nested insights to reduce API calls
        // Also fetches profile_picture_url to refresh it on each sync (prevents expiration issues)
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

        // Update profile picture URL on the integration to prevent expiration issues
        if (isset($data['profile_picture_url'])) {
            $integration->setProfilePictureUrl($data['profile_picture_url']);
        }

        // Process insights from nested response
        $insightDTOs = [];
        if (isset($data['insights']['data'])) {
            foreach ($data['insights']['data'] as $integrationData) {
                $insightDTOs[] = InstagramIntegrationInsightDTO::fromArray($integrationData);
            }
        }

        // Add followers_count as an insight DTO
        if (isset($data['followers_count'])) {
            $insightDTOs[] = new InstagramIntegrationInsightDTO('followers_count', 'day', (float) $data['followers_count']);
        }

        $this->createInsightEntities($integration, $insightDTOs);

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
            // Fetch subscriber count from YouTube Data API
            $youtube = new YouTube($this->googleClient);
            $channelResponse = $youtube->channels->listChannels('statistics', ['mine' => true]);
            $channels = $channelResponse->getItems();
            $insightDTOs = [];

            if (!empty($channels)) {
                $statistics = $channels[0]->getStatistics();
                $subscriberCount = (float) $statistics->getSubscriberCount();
                $insightDTOs[] = new YoutubeIntegrationInsightDTO('subscriberCount', $subscriberCount);
            }

            // Fetch analytics metrics from YouTube Analytics API
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

    private function createInsightEntities(Integration $integration, array $insightDTOs): void
    {
        $this->createInsightEntitiesFromDTOs($integration, $insightDTOs, InstagramIntegrationInsightDTO::getMetricMapping());
    }

    /**
     * @param Integration $integration
     * @param array<InstagramIntegrationInsightDTO|YoutubeIntegrationInsightDTO> $insightDTOs
     * @param array<string, IntegrationInsightType> $metricMapping
     */
    private function createInsightEntitiesFromDTOs(Integration $integration, array $insightDTOs, array $metricMapping): void
    {
        foreach ($insightDTOs as $dto) {
            $insightType = $metricMapping[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            if ($this->shouldCreateInsight($integration, $insightType, $dto->getValue())) {
                $insight = new IntegrationInsight();
                $insight
                    ->setType($insightType)
                    ->setValue($dto->getValue())
                    ->setValueFormat($insightType->getValueFormat())
                    ->setIntegration($integration)
                    ->setUser($integration->getUser());

                $this->integrationInsightRepository->save($insight);
            }
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
            value: $value
        ) === null;
    }

    public function getDetail(
        User $user,
        Integration $integration,
        TimePeriod $timePeriod,
    ): ShowIntegrationDetailResponseDTO {
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

        $totalFollowers = InsightHelper::getInsightValueByType($currentInsights, IntegrationInsightType::TotalFollowers) ?? 0.0;
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        $timelines = $this->buildTimelines($user, $integration, $currentPeriodStart);
        $isYoutubeReportPending = $this->isYoutubeReportPending($integration);

        return new ShowIntegrationDetailResponseDTO(
            totalFollowers: $totalFollowers,
            postCount: $postCount,
            streak: $streak,
            insights: $insightsWithEvolution,
            timelines: $timelines,
            isYoutubeReportPending: $isYoutubeReportPending,
        );
    }

    /**
     * @return IntegrationInsightTimelineDTO[]
     */
    private function buildTimelines(
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

        $timelines = [];
        foreach (self::GRAPH_INSIGHT_TYPES as $type) {
            $typeInsights = $insightsByType[$type->value] ?? [];

            // Convert entities to DTOs first
            $points = array_map(
                fn ($insight) => new IntegrationInsightTimelinePointDTO(
                    createdAt: $insight->getCreatedAt(),
                    value: $insight->getValue(),
                ),
                $typeInsights,
            );

            // Fill gaps using DTOs
            $filledPoints = TimelineGapFillerHelper::fillIntegrationInsightTimelinePointsDailyGaps($points);

            $timelines[] = new IntegrationInsightTimelineDTO(
                type: $type,
                points: $filledPoints,
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

            $evolutionPercentage = InsightEvolutionHelper::calculateEvolutionPercentage($currentValue, $previousValue);

            $insightsWithEvolution[] = new IntegrationInsightWithEvolutionDTO(
                type: $type,
                value: $currentValue,
                evolutionPercentage: $evolutionPercentage,
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

            throw new OAuthTokenRevokedException($integration->getId());
        }
    }
}
