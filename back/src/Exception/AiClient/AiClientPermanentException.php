<?php

namespace App\Exception\AiClient;

use Symfony\Component\HttpFoundation\Response;

final class AiClientPermanentException extends AiClientException
{
    public const CODE = 2;

    public function __construct(
        string $message,
        private readonly ?int $httpStatusCode = null,
        ?\Throwable $previous = null,
    ) {
        parent::__construct(
            $message,
            self::CODE,
            Response::HTTP_INTERNAL_SERVER_ERROR,
            previous: $previous
        );
    }

    public function getHttpStatusCode(): ?int
    {
        return $this->httpStatusCode;
    }
}
