<?php

namespace App\Exception\Mailing;

use Symfony\Component\HttpFoundation\Response;

final class MailingRetryableException extends MailingException
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
