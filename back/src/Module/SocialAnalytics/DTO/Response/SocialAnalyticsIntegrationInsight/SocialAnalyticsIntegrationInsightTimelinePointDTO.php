<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight;

use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsIntegrationInsightTimelinePointDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly \DateTimeImmutable $createdAt,
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly float $value,
    ) {}

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getValue(): float
    {
        return $this->value;
    }
}
