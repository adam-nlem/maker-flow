<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Entity\User;
use App\Module\SocialAnalytics\DTO\Response\ShowSocialAnalyticsIntegrationOverviewResponseDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsIntegrationInsightRepository;
use App\Module\SocialAnalytics\Repository\SocialAnalyticsPostRepository;

class SocialAnalyticsIntegrationOverviewService
{
    public function __construct(
        private readonly SocialAnalyticsIntegrationInsightRepository $insightRepository,
        private readonly SocialAnalyticsPostRepository $postRepository,
    ) {}

    public function getOverview(
        User $user,
        Integration $integration,
        SocialAnalyticsTimePeriod $timePeriod,
    ): ShowSocialAnalyticsIntegrationOverviewResponseDTO {
        $insights = $this->insightRepository->getLatestByUserAndByIntegration($user, $integration);

        $totalFollowers = $this->extractTotalFollowers($insights);
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        return new ShowSocialAnalyticsIntegrationOverviewResponseDTO(
            totalFollowers: $totalFollowers,
            postCount: $postCount,
            streak: $streak,
            insights: $insights,
        );
    }

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
