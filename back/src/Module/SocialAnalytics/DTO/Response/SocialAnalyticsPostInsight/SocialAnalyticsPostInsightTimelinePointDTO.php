<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight;

use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostInsightTimelinePointDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly float $hoursAfterPublication,
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly int $value,
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly ?float $averageValue,
    ) {}

    public function getHoursAfterPublication(): float
    {
        return $this->hoursAfterPublication;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public function getAverageValue(): ?float
    {
        return $this->averageValue;
    }
}
