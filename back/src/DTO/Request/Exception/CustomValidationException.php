<?php

namespace App\DTO\Request\Exception;

use App\Entity\Enum\ValidationExceptionType;
use Exception;

class CustomValidationException extends Exception
{
    public function __construct(
        private array $data,
    ) {}


    public function getData(): array
    {
        return $this->data;
    }
}
