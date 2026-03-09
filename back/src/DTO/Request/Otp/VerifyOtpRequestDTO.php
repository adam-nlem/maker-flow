<?php

namespace App\DTO\Request\Otp;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class VerifyOtpRequestDTO extends AbstractRequestDTO
{
    private string $pendingOtpToken;
    private string $code;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->pendingOtpToken = $payload['pendingOtpToken'];
        $this->code = $payload['code'];
    }

    protected function buildObject(): mixed
    {
        return [
            'pendingOtpToken' => $this->pendingOtpToken,
            'code' => $this->code,
        ];
    }

    public function getPendingOtpToken(): string
    {
        return $this->pendingOtpToken;
    }

    public function getCode(): string
    {
        return $this->code;
    }
}
