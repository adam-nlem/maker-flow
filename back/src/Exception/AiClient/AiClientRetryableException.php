<?php

namespace App\Exception\AiClient;

use Symfony\Component\HttpFoundation\Response;

final class AiClientRetryableException extends AiClientException
{
    public const CODE = 1;

    public function __construct(
        string $message,
        private readonly ?int $httpStatusCode = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct(
            $message,
            self::CODE,
            Response::HTTP_SERVICE_UNAVAILABLE,
            previous: $previous
        );
    }

    public function getHttpStatusCode(): ?int
    {
        return $this->httpStatusCode;
    }
}
