<?php

namespace App\DTO;

use Symfony\Component\Serializer\Attribute\Groups;

class AggregatedInsightDTO
{
    public function __construct(
        #[Groups(['api_post_groups_list', 'api_post_groups_show', 'api_posts_list', 'api_posts_show'])]
        private readonly string $type,
        #[Groups(['api_post_groups_list', 'api_post_groups_show', 'api_posts_list', 'api_posts_show'])]
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
