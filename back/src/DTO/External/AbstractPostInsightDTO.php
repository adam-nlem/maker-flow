<?php

namespace App\DTO\External;

use App\Entity\Enum\PostInsightType;

abstract class AbstractPostInsightDTO
{
    public function __construct(
        protected readonly ?PostInsightType $type,
        protected readonly float $value,
    ) {}

    public function getType(): ?PostInsightType
    {
        return $this->type;
    }

    public function getValue(): float
    {
        return $this->value;
    }

    /**
     * Returns the insight types that count as interactions for the platform.
     *
     * @return PostInsightType[]
     */
    abstract protected static function getInteractionTypes(): array;

    /**
     * @param static[] $postInsightDTOs
     */
    public static function buildTotalInteractions(array $postInsightDTOs): static
    {
        $valuesByType = [];

        foreach ($postInsightDTOs as $dto) {
            if ($dto->getType() !== null) {
                $valuesByType[$dto->getType()->value] = $dto->getValue();
            }
        }

        $total = 0.0;
        foreach (static::getInteractionTypes() as $type) {
            $total += $valuesByType[$type->value] ?? 0.0;
        }

        return new static(
            type: PostInsightType::TotalInteractions,
            value: $total,
        );
    }
}
