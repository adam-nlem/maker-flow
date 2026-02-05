<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight;

use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Symfony\Component\Serializer\Attribute\Groups;

class SocialAnalyticsPostRankingItemDTO
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly SocialAnalyticsPost $post,
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly float $score,
    ) {}

    public function getPost(): SocialAnalyticsPost
    {
        return $this->post;
    }

    public function getScore(): float
    {
        return $this->score;
    }
}
