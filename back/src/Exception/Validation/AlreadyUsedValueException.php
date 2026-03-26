<?php

namespace App\Exception\Validation;

use Symfony\Component\HttpFoundation\Response;

final class AlreadyUsedValueException extends ValidationException
{
    public const CODE = 1;

    public function __construct(private readonly string $propertyName)
    {
        parent::__construct(
            sprintf('Value already used for property "%s".', $propertyName),
            self::CODE,
            Response::HTTP_CONFLICT,
            ['propertyName' => $propertyName],
        );
    }

    public function getPropertyName(): string
    {
        return $this->propertyName;
    }
}
