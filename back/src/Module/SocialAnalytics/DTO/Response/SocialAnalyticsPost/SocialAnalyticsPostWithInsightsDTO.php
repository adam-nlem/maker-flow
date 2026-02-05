<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost;

use App\DTO\Response\ResponseDTOInterface;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostWithInsightsDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly SocialAnalyticsPost $post,
        /** @var SocialAnalyticsPostInsightWithEvolutionDTO[] */
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly array $insights,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly ?float $engagementByFollowers,
        #[Groups(['api_modules_social_analytics_posts_list'])]
        private readonly ?float $engagementByReach,
    ) {}

    public function getData(): array
    {
        return [
            'post' => $this->post,
            'insights' => $this->insights,
            'engagementByFollowers' => $this->engagementByFollowers,
            'engagementByReach' => $this->engagementByReach,
        ];
    }

    public function getPost(): SocialAnalyticsPost
    {
        return $this->post;
    }

    public function getInsights(): array
    {
        return $this->insights;
    }

    public function getEngagementByFollowers(): ?float
    {
        return $this->engagementByFollowers;
    }

    public function getEngagementByReach(): ?float
    {
        return $this->engagementByReach;
    }
}
