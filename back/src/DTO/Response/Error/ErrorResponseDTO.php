<?php

namespace App\DTO\Response\Error;

use App\DTO\Response\ResponseDTOInterface;
use App\Exception\AppException;

class ErrorResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly int $code,
        private readonly int $httpStatus,
        private readonly array $meta = [],
    ) {}

    public static function fromAppException(AppException $appException): self
    {
        return new self(
            $appException->getFullCode(),
            $appException->getHttpStatus(),
            $appException->getMeta(),
        );
    }

    public function getData(): array
    {
        return [
            'code' => $this->code,
            'httpStatus' => $this->httpStatus,
            ...($this->meta !== [] ? ['meta' => $this->meta] : []),
        ];
    }
}
