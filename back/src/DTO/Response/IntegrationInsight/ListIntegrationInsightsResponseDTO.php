<?php

namespace App\DTO\Response\IntegrationInsight;

use App\DTO\Response\ResponseDTOInterface;

class ListIntegrationInsightsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        /** @var ListIntegrationInsightsGroupedByIntegrationResponseDTO[] */
        private readonly array $groups,
        /** @var array<array{type: string, value: float}> */
        private readonly array $aggregatedInsights,
    ) {}

    public function getData(): array
    {
        return [
            'groups' => array_map(
                fn(ListIntegrationInsightsGroupedByIntegrationResponseDTO $g) => $g->getData(),
                $this->getGroups(),
            ),
            'aggregatedInsights' => $this->getAggregatedInsights(),
        ];
    }

    /**
     * @return ListIntegrationInsightsGroupedByIntegrationResponseDTO[]
     */
    public function getGroups(): array
    {
        return $this->groups;
    }

    /**
     * @return array<array{type: string, value: float}>
     */
    public function getAggregatedInsights(): array
    {
        return $this->aggregatedInsights;
    }
}
