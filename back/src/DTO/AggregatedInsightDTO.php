<?php

namespace App\DTO;

use Symfony\Component\Serializer\Attribute\Groups;

class AggregatedInsightDTO
{
    public function __construct(
        #[Groups(['api_post_groups_list'])]
        private readonly string $type,
        #[Groups(['api_post_groups_list'])]
        private readonly float $value,
    ) {}

    public function getType(): string
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }
}
