<?php

namespace App\Service\Mailing\Exception;

class MailingRetryableException extends MailingServiceException
{
    public const CODE = 1;

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
