<?php

namespace App\DTO\External\Instagram;

class InstagramInsightDTO
{
    public function __construct(
        private readonly string $name,
        private readonly string $period,
        private readonly int $value,
    ) {}

    public static function fromArray(array $data): self
    {
        $value = 0;

        if (isset($data['total_value']['value'])) {
            $value = $data['total_value']['value'];
        }

        return new self(
            name: $data['name'],
            period: $data['period'],
            value: $value,
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
}
