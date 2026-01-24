<?php

namespace App\Module\SocialAnalytics\DTO\Response;

use App\DTO\Response\ResponseDTOInterface;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use Symfony\Component\Serializer\Attribute\Groups;

class ShowSocialAnalyticsIntegrationOverviewResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_overview'])]
        private readonly int $totalFollowers,
        #[Groups(['api_modules_social_analytics_integration_insights_overview'])]
        private readonly int $postCount,
        #[Groups(['api_modules_social_analytics_integration_insights_overview'])]
        private readonly int $streak,
        // TODO: have two types of insights (the main ones with evolution in % and the data points per day)
        /** @var SocialAnalyticsIntegrationInsight[] */
        #[Groups(['api_modules_social_analytics_integration_insights_overview'])]
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
