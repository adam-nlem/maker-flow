<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost;

use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsPostInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostInsightWithEvolutionDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly SocialAnalyticsPostInsightType $type,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly int $value,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly ?string $evolutionPercentage,
    ) {}

    public function getType(): SocialAnalyticsPostInsightType
    {
        return $this->type;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public function getEvolutionPercentage(): ?string
    {
        return $this->evolutionPercentage;
    }
}
