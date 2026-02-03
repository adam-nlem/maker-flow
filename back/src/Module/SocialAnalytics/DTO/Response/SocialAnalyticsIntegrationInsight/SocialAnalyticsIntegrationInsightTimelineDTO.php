<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsIntegrationInsightTimelineDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly SocialAnalyticsIntegrationInsightType $type,
        /** @var SocialAnalyticsIntegrationInsightTimelinePointDTO[] */
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly array $points,
    ) {}

    public function getType(): SocialAnalyticsIntegrationInsightType
    {
        return $this->type;
    }

    /**
     * @return SocialAnalyticsIntegrationInsightTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
