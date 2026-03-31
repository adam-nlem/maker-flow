<?php

namespace App\DTO;

class AutoGroupSignal
{
    public function __construct(
        private readonly float $weight,
        private readonly float $score,
    ) {}

    public function getWeight(): float
    {
        return $this->weight;
    }

    public function getScore(): float
    {
        return $this->score;
    }

    public function getWeightedScore(): float
    {
        return $this->weight * $this->score;
    }
}
