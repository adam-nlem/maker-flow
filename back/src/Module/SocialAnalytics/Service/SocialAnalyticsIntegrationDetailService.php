<?php

namespace App\Module\SocialAnalytics\Service;

use App\Entity\Integration;
use App\Entity\User;
use App\Module\SocialAnalytics\DTO\Response\ShowSocialAnalyticsIntegrationDetailResponseDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
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
        $insights = $this->insightRepository->getLatestByUserAndByIntegration($user, $integration);

        $totalFollowers = $this->extractTotalFollowers($insights);
        $postCount = $this->postRepository->countByIntegration($integration);
        $streak = $this->postRepository->calculateStreak($integration);

        return new ShowSocialAnalyticsIntegrationDetailResponseDTO(
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
