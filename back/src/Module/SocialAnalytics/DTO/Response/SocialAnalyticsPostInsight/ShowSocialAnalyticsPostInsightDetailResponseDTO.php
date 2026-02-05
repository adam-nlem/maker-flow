<?php

namespace App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPostInsight;

use App\DTO\Response\ResponseDTOInterface;
use App\Module\SocialAnalytics\DTO\Response\SocialAnalyticsPost\SocialAnalyticsPostInsightWithEvolutionDTO;
use App\Module\SocialAnalytics\Entity\SocialAnalyticsPost;
use Symfony\Component\Serializer\Attribute\Groups;

class ShowSocialAnalyticsPostInsightDetailResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly SocialAnalyticsPost $post,
        /** @var SocialAnalyticsPostInsightWithEvolutionDTO[] */
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly array $insightsWithEvolution,
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly ?float $engagementByFollowers,
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly ?float $engagementByReach,
        /** @var SocialAnalyticsPostInsightTimelineDTO[] */
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly array $timelines,
        /** @var SocialAnalyticsPostRankingItemDTO[] */
        #[Groups(['api_modules_social_analytics_post_insights_detail'])]
        private readonly array $ranking,
    ) {
    }

    public function getData(): array
    {
        return [
            'post' => $this->post,
            'insightsWithEvolution' => $this->insightsWithEvolution,
            'engagementByFollowers' => $this->engagementByFollowers,
            'engagementByReach' => $this->engagementByReach,
            'timelines' => $this->timelines,
            'ranking' => $this->ranking,
        ];
    }

    public function getPost(): SocialAnalyticsPost
    {
        return $this->post;
    }

    /**
     * @return SocialAnalyticsPostInsightWithEvolutionDTO[]
     */
    public function getInsightsWithEvolution(): array
    {
        return $this->insightsWithEvolution;
    }

    public function getEngagementByFollowers(): ?float
    {
        return $this->engagementByFollowers;
    }

    public function getEngagementByReach(): ?float
    {
        return $this->engagementByReach;
    }

    /**
     * @return SocialAnalyticsPostInsightTimelineDTO[]
     */
    public function getTimelines(): array
    {
        return $this->timelines;
    }

    /**
     * @return SocialAnalyticsPostRankingItemDTO[]
     */
    public function getRanking(): array
    {
        return $this->ranking;
    }
}
