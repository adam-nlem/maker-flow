<?php

namespace App\DTO\External\Instagram;

class InstagramInsightDTO
{
    public function __construct(
        private readonly string $name,
        private readonly string $period,
        private readonly int $value,
        private readonly ?string $endTime,
    ) {}

    public static function fromArray(array $data): self
    {
        $value = 0;
        $endTime = null;

        if (isset($data['values']) && is_array($data['values']) && count($data['values']) > 0) {
            $latestValue = $data['values'][count($data['values']) - 1];
            $value = $latestValue['value'] ?? 0;
            $endTime = $latestValue['end_time'] ?? null;
        }

        return new self(
            name: $data['name'],
            period: $data['period'],
            value: $value,
            endTime: $endTime,
        );
    }

    public static function fromApiResponse(array $response): array
    {
        $insights = [];

        if (isset($response['data']) && is_array($response['data'])) {
            foreach ($response['data'] as $insightData) {
                $insights[] = self::fromArray($insightData);
            }
        }

        return $insights;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getPeriod(): string
    {
        return $this->period;
    }

    public function getValue(): int
    {
        return $this->value;
    }

    public function getEndTime(): ?string
    {
        return $this->endTime;
    }
}
