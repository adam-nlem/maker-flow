<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostInsightTimelineDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly SocialAnalyticsPostInsightType $type,
        /** @var SocialAnalyticsPostInsightTimelinePointDTO[] */
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly array $points,
    ) {}

    public function getType(): SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    /**
     * @return SocialAnalyticsPostInsightTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
