<?php

namespace App\Service\GeminiClient\Exception;

class GeminiPermanentException extends GeminiClientServiceException
{
    public const CODE = 2;

    public function __construct(
        string $message,
        private readonly ?int $httpStatusCode = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct($message, self::CODE, $previous);
    }

    public function getHttpStatusCode(): ?int
    {
        return $this->httpStatusCode;
    }
}
