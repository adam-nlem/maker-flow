<?php

namespace App\DTO\Response\IntegrationInsight;

use Symfony\Component\Serializer\Attribute\Groups;

class IntegrationInsightTimelinePointDTO
{
    public function __construct(
        #[Groups(['api_integration_insights_detail'])]
        private readonly \DateTimeImmutable $createdAt,
        #[Groups(['api_integration_insights_detail'])]
        private readonly float $value,
    ) {}

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getValue(): float
    {
        return $this->value;
    }
}
