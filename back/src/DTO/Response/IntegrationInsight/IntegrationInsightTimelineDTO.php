<?php

namespace App\DTO\Response\IntegrationInsight;

use App\Entity\Enum\IntegrationInsightType;
use Symfony\Component\Serializer\Attribute\Groups;

class IntegrationInsightTimelineDTO
{
    public function __construct(
        #[Groups(['api_integration_insights_detail'])]
        private readonly IntegrationInsightType $type,
        /** @var IntegrationInsightTimelinePointDTO[] */
        #[Groups(['api_integration_insights_detail'])]
        private readonly array $points,
    ) {}

    public function getType(): IntegrationInsightType
    {
        return $this->type;
    }

    /**
     * @return IntegrationInsightTimelinePointDTO[]
     */
    public function getPoints(): array
    {
        return $this->points;
    }
}
