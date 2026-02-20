<?php

namespace App\DTO\Response\PostInsight;

use App\DTO\Response\ResponseDTOInterface;
use App\DTO\Response\Post\PostInsightWithEvolutionDTO;
use App\Entity\Post;
use Symfony\Component\Serializer\Attribute\Groups;

class ShowPostInsightDetailResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_post_insights_detail'])]
        private readonly Post $post,
        /** @var PostInsightWithEvolutionDTO[] */
        #[Groups(['api_post_insights_detail'])]
        private readonly array $insightsWithEvolution,
        #[Groups(['api_post_insights_detail'])]
        private readonly ?float $engagementByFollowers,
        #[Groups(['api_post_insights_detail'])]
        private readonly ?float $engagementByReach,
        /** @var PostInsightTimelineDTO[] */
        #[Groups(['api_post_insights_detail'])]
        private readonly array $timelines,
        /** @var PostRankingItemDTO[] */
        #[Groups(['api_post_insights_detail'])]
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

    public function getPost(): Post
    {
        return $this->post;
    }

    /**
     * @return PostInsightWithEvolutionDTO[]
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
     * @return PostInsightTimelineDTO[]
     */
    public function getTimelines(): array
    {
        return $this->timelines;
    }

    /**
     * @return PostRankingItemDTO[]
     */
    public function getRanking(): array
    {
        return $this->ranking;
    }
}
