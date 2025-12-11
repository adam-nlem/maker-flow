<?php

namespace App\Service;

abstract class ServiceException extends \Exception
{
    public function __construct($message, $codeSuffix, ?\Throwable $previous = null)
    {
        parent::__construct($message, $this->createCode($codeSuffix), $previous);
    }

    abstract protected function getServiceCode(): int;

    private function createCode($code)
    {
        return $this->getServiceCode() + $code;
    }
}
