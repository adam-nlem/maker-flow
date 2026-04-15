<?php

namespace App\DTO\Response\IntegrationInsight;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Integration;
use Symfony\Component\Serializer\Attribute\Groups;

class ListIntegrationInsightsGroupedByIntegrationResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_integration_insights_list'])]
        private readonly Integration $integration,
        /** @var IntegrationInsightWithEvolutionDTO[] */
        #[Groups(['api_integration_insights_list'])]
        private readonly array $insights,
    ) {}

    public function getData(): array
    {
        return [
            'integration' => $this->integration,
            'insights' => $this->insights,
        ];
    }

    public function getIntegration(): Integration
    {
        return $this->integration;
    }

    public function getInsights(): array
    {
        return $this->insights;
    }
}
