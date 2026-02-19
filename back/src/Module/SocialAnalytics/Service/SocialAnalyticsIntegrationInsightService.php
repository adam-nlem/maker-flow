<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Enum\IntegrationProvider;
use App\Entity\Integration;
use App\Entity\User;
use App\Helper\DateHelper;
use App\Module\SocialAnalytics\DTO\External\Instagram\InstagramIntegrationInsightDTO;
use App\Module\SocialAnalytics\DTO\External\Youtube\YoutubeIntegrationInsightDTO;
use Google\Service\YouTube;
use Google\Service\YouTubeAnalytics;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\ShowSocialAnalyticsIntegrationDetailResponseDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightTimelineDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightTimelinePointDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightWithEvolutionDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Helper\InsightHelper;
use App\Module\SocialAnalytics\Helper\TimelineGapFillerHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;
use App\Module\SocialAnalytics\Repository\YoutubeReportingJobRepository;
use App\Repository\IntegrationRepository;
use App\Service\Integration\InstagramOAuthService;
use App\Service\Integration\YoutubeOAuthService;
use Google\Client;
use Psr\Log\LoggerInterface;
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
        private readonly Client $googleClient,
        private readonly YoutubeOAuthService $youtubeOAuthService,
        private readonly YoutubeReportingJobRepository $youtubeReportingJobRepository,
        private LoggerInterface $log
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

        // Single API call with nested insights to reduce API calls
        // Also fetches profile_picture_url to refresh it on each sync (prevents expiration issues)
        $response = $this->httpClient->request('GET', sprintf('%s/%s', $this->instagramGraphUrl, $integration->getAccountId()), [
            'query' => [
                'fields' => sprintf('followers_count,profile_picture_url,insights.metric(%s).period(day).metric_type(total_value)', $metrics),
                'access_token' => $integration->getAccessToken(),
            ],
        ]);

        $data = $response->toArray();

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
        if ($integration->getProvider() !== IntegrationProvider::Youtube) {
            throw new \InvalidArgumentException('Integration must be a YouTube integration');
        }

        $this->youtubeOAuthService->configureGoogleClient();
        $integration = $this->youtubeOAuthService->refreshTokenIfNeeded($integration);

        $this->googleClient->setAccessToken($integration->getAccessToken());

        // Fetch subscriber count from YouTube Data API
        $youtube = new YouTube($this->googleClient);
        $channelResponse = $youtube->channels->listChannels('statistics', ['mine' => true]);
        $channels = $channelResponse->getItems();
        //dd($channelResponse);
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
     * @param array<string, SocialAnalyticsIntegrationInsightType> $metricMapping
     */
    private function createInsightEntitiesFromDTOs(Integration $integration, array $insightDTOs, array $metricMapping): void
    {
        foreach ($insightDTOs as $dto) {
            $insightType = $metricMapping[$dto->getName()] ?? null;

            if ($insightType === null) {
                continue;
            }

            if ($this->shouldCreateInsight($integration, $insightType, $dto->getValue())) {
                $insight = new SocialAnalyticsIntegrationInsight();
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
        SocialAnalyticsIntegrationInsightType $type,
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

        $totalFollowers = InsightHelper::getInsightValueByType($currentInsights, SocialAnalyticsIntegrationInsightType::TotalFollowers) ?? 0.0;
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        $timelines = $this->buildTimelines($user, $integration, $currentPeriodStart);
        $isYoutubeReportPending = $this->isYoutubeReportPending($integration);

        return new ShowSocialAnalyticsIntegrationDetailResponseDTO(
            totalFollowers: $totalFollowers,
            postCount: $postCount,
            streak: $streak,
            insights: $insightsWithEvolution,
            timelines: $timelines,
            isYoutubeReportPending: $isYoutubeReportPending,
        );
    }

    /**
     * @return SocialAnalyticsIntegrationInsightTimelineDTO[]
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
                fn ($insight) => new SocialAnalyticsIntegrationInsightTimelinePointDTO(
                    createdAt: $insight->getCreatedAt(),
                    value: $insight->getValue(),
                ),
                $typeInsights,
            );

            // Fill gaps using DTOs
            $filledPoints = TimelineGapFillerHelper::fillIntegrationInsightTimelinePointsDailyGaps($points);

            $timelines[] = new SocialAnalyticsIntegrationInsightTimelineDTO(
                type: $type,
                points: $filledPoints,
            );
        }

        return $timelines;
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

    private function isYoutubeReportPending(Integration $integration): ?bool
    {
        if ($integration->getProvider() !== IntegrationProvider::Youtube) {
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
}
