<?php

namespace App\DTO\Response\PostGroup;

use App\DTO\AggregatedInsightDTO;
use App\DTO\Response\ResponseDTOInterface;
use App\Entity\PostGroup;
use App\Entity\Script;
use Symfony\Component\Serializer\Attribute\Groups;

class PostGroupWithInsightsAndScriptResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_post_groups_list', 'api_post_groups_show'])]
        private readonly PostGroup $postGroup,
        /** @var AggregatedInsightDTO[] */
        #[Groups(['api_post_groups_list', 'api_post_groups_show'])]
        private readonly array $aggregatedInsights,
        #[Groups(['api_post_groups_list', 'api_post_groups_show'])]
        private readonly ?Script $script,
        #[Groups(['api_post_groups_list', 'api_post_groups_show'])]
        private readonly ?float $engagementByViews,
    ) {}

    public function getData(): array
    {
        return [
            'postGroup' => $this->postGroup,
            'aggregatedInsights' => $this->aggregatedInsights,
            'script' => $this->script,
            'engagementByViews' => $this->engagementByViews,
        ];
    }

    public function getPostGroup(): PostGroup
    {
        return $this->postGroup;
    }

    /**
     * @return AggregatedInsightDTO[]
     */
    public function getAggregatedInsights(): array
    {
        return $this->aggregatedInsights;
    }

    public function getScript(): ?Script
    {
        return $this->script;
    }

    public function getEngagementByViews(): ?float
    {
        return $this->engagementByViews;
    }
}
