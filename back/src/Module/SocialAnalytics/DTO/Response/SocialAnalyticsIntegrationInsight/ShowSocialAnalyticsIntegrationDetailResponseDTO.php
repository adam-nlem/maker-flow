<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class ShowSocialAnalyticsIntegrationDetailResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly int $totalFollowers,
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly int $postCount,
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly int $streak,
        /** @var SocialAnalyticsIntegrationInsightWithEvolutionDTO[] */
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly array $insights,
    ) {}

    public function getData(): array
    {
        return [
            'totalFollowers' => $this->totalFollowers,
            'postCount' => $this->postCount,
            'streak' => $this->streak,
            'insights' => $this->insights,
        ];
    }

    public function getTotalFollowers(): int
    {
        return $this->totalFollowers;
    }

    public function getPostCount(): int
    {
        return $this->postCount;
    }

    public function getStreak(): int
    {
        return $this->streak;
    }

    public function getInsights(): array
    {
        return $this->insights;
    }
}
