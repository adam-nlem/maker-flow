<?php

namespace App\DTO\Response\IntegrationInsight;

use App\Entity\Enum\IntegrationInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class IntegrationInsightWithEvolutionDTO
{
    public function __construct(
        #[Groups(['api_integration_insights_detail', 'api_integration_insights_list'])]
        private readonly IntegrationInsightType $type,
        #[Groups(['api_integration_insights_detail', 'api_integration_insights_list'])]
        private readonly float $value,
        #[Groups(['api_integration_insights_detail', 'api_integration_insights_list'])]
        private readonly ?string $evolutionPercentage,
    ) {}

    public function getType(): IntegrationInsightType
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getEvolutionPercentage(): ?string
    {
        return $this->evolutionPercentage;
    }
}
