<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsIntegrationInsight;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsIntegrationInsightDailyPointsDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly SocialAnalyticsIntegrationInsightType $type,
        /** @var SocialAnalyticsIntegrationInsight[] */
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly array $insights,
    ) {}

    public function getType(): SocialAnalyticsIntegrationInsightType
    {
        return $this->type;
    }

    /**
     * @return SocialAnalyticsIntegrationInsight[]
     */
    public function getInsights(): array
    {
        return $this->insights;
    }
}
