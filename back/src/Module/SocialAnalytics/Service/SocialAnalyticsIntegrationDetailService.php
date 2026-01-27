<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Entity\User;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\ShowSocialAnalyticsIntegrationDetailResponseDTO;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight\SocialAnalyticsIntegrationInsightWithEvolutionDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use App\Module\SocialAnalytics\Helper\InsightEvolutionHelper;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;

class SocialAnalyticsIntegrationDetailService
{
    public function __construct(
        private readonly SocialAnalyticsIntegrationInsightRepository $insightRepository,
        private readonly SocialAnalyticsPostRepository $postRepository,
    ) {}

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

        $currentInsights = $this->insightRepository->getByUserAndIntegrationAndTimePeriod(
            $user,
            $integration,
            $currentPeriodStart,
            $currentPeriodEnd,
        );

        $previousInsights = $this->insightRepository->getByUserAndIntegrationAndTimePeriod(
            $user,
            $integration,
            $previousPeriodStart,
            $previousPeriodEnd,
        );

        $insightsWithEvolution = $this->buildInsightsWithEvolution($currentInsights, $previousInsights);

        $totalFollowers = $this->extractTotalFollowers($currentInsights);
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        return new ShowSocialAnalyticsIntegrationDetailResponseDTO(
            totalFollowers: $totalFollowers,
            postCount: $postCount,
            streak: $streak,
            insights: $insightsWithEvolution,
        );
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

    /**
     * @param SocialAnalyticsIntegrationInsight[] $insights
     */
    private function extractTotalFollowers(array $insights): int
    {
        foreach ($insights as $insight) {
            if ($insight->getType() === SocialAnalyticsIntegrationInsightType::TotalFollowers) {
                return $insight->getValue();
            }
        }

        return 0;
    }
}
