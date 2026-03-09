<?php

namespace App\DTO\Request\Otp;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ResendOtpRequestDTO extends AbstractRequestDTO
{
    private string $pendingOtpToken;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->pendingOtpToken = $payload['pendingOtpToken'];
    }

    protected function buildObject(): mixed
    {
        return [
            'pendingOtpToken' => $this->pendingOtpToken,
        ];
    }

    public function getPendingOtpToken(): string
    {
        return $this->pendingOtpToken;
    }
}
