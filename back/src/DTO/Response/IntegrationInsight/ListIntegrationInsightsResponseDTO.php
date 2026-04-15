<?php

namespace App\DTO\Response\IntegrationInsight;

use App\DTO\Response\ResponseDTOInterface;

class ListIntegrationInsightsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        /** @var ListIntegrationInsightsGroupedByIntegrationResponseDTO[] */
        private readonly array $groups,
        private readonly IntegrationInsightsOverviewDTO $overview,
        /** @var IntegrationInsightsViewsTimelineDTO[] */
        private readonly array $viewsTimeline,
    ) {}

    public function getData(): array
    {
        return [
            'groups' => array_map(
                fn(ListIntegrationInsightsGroupedByIntegrationResponseDTO $g) => $g->getData(),
                $this->getGroups(),
            ),
            'overview' => $this->getOverview()->getData(),
            'viewsTimeline' => array_map(
                fn(IntegrationInsightsViewsTimelineDTO $v) => $v->getData(),
                $this->getViewsTimeline(),
            ),
        ];
    }

    /**
     * @return ListIntegrationInsightsGroupedByIntegrationResponseDTO[]
     */
    public function getGroups(): array
    {
        return $this->groups;
    }

    public function getOverview(): IntegrationInsightsOverviewDTO
    {
        return $this->overview;
    }

    /**
     * @return IntegrationInsightsViewsTimelineDTO[]
     */
    public function getViewsTimeline(): array
    {
        return $this->viewsTimeline;
    }
}
