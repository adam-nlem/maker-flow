<?php

namespace App\DTO\Response\IntegrationInsight;

class IntegrationInsightsViewsTimelinePointDTO
{
    public function __construct(
        private readonly string $date,
        private readonly float $value,
    ) {}

    public function getData(): array
    {
        return [
            'date' => $this->getDate(),
            'value' => $this->getValue(),
        ];
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function getValue(): float
    {
        return $this->value;
    }
}
