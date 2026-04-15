<?php

namespace App\DTO\Response\Dashboard;

class DashboardViewsTimelinePointDTO
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
