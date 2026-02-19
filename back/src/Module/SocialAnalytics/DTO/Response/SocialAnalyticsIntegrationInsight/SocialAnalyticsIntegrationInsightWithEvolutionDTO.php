<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsIntegrationInsight;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsIntegrationInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsIntegrationInsightWithEvolutionDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly SocialAnalyticsIntegrationInsightType $type,
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly float $value,
        #[Groups(['api_modules_social_analytics_integration_insights_detail'])]
        private readonly ?string $evolutionPercentage,
    ) {}

    public function getType(): SocialAnalyticsIntegrationInsightType
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getEvolutionPercentage(): ?string
    {
        return $this->evolutionPercentage;
    }
}
