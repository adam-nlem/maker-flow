<?php

namespace App\Exception;

abstract class AppException extends \Exception
{
    private int $httpStatus;
    private array $meta;

    public function __construct(
        string $message,
        int $codeSuffix,
        int $httpStatus,
        array $meta = [],
        ?\Throwable $previous = null,
    ) {
        $this->httpStatus = $httpStatus;
        $this->meta = $meta;

        parent::__construct(
            $message,
            $this->getDomainCode()->value * 1000 + $codeSuffix,
            $previous
        );
    }

    abstract protected function getDomainCode(): DomainCode;

    public function getHttpStatus(): int
    {
        return $this->httpStatus;
    }

    public function getMeta(): array
    {
        return $this->meta;
    }

    public function getFullCode(): int
    {
        return $this->getCode();
    }
}
