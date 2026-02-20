<?php

namespace App\DTO\Response\PostInsight;

use Symfony\Component\Serializer\Attribute\Groups;

class PostInsightTimelinePointDTO
{
    public function __construct(
        #[Groups(['api_post_insights_detail'])]
        private readonly float $hoursAfterPublication,
        #[Groups(['api_post_insights_detail'])]
        private readonly float $value,
        #[Groups(['api_post_insights_detail'])]
        private readonly ?float $averageValue,
    ) {}

    public function getHoursAfterPublication(): float
    {
        return $this->hoursAfterPublication;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    public function getAverageValue(): ?float
    {
        return $this->averageValue;
    }
}
