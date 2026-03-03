<?php

namespace App\Service\AiClient\Exception;

class AiClientPermanentException extends AiClientServiceException
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
