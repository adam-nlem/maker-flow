<?php

namespace App\DTO\Request\Exception;

use App\Entity\Enum\ValidationExceptionType;

class CustomValidationExceptionDataItem
{
    public function __construct(
        private ValidationExceptionType $type,
        private string $propertyName,
    ) {}

    public function getData(): array
    {
        return [
            "type" => $this->getType()->value,
            "propertyName" => $this->getPropertyName(),
        ];
    }

    public function getType(): ValidationExceptionType
    {
        return $this->type;
    }

    public function getPropertyName(): string
    {
        return $this->propertyName;
    }
}
