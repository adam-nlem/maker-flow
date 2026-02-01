<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPostInsight;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostInsightWithEvolutionDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
        private readonly SocialAnalyticsPostInsight $insight,
        #[Groups(['api_modules_social_analytics_posts_list', 'api_modules_social_analytics_post_insights_detail'])]
        private readonly ?string $evolutionPercentage,
    ) {}

    public function getInsight(): SocialAnalyticsPostInsight
    {
        return $this->insight;
    }

    public function getEvolutionPercentage(): ?string
    {
        return $this->evolutionPercentage;
    }
}
