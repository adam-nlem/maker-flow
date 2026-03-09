<?php

namespace App\DTO\Response\Otp;

use App\DTO\Response\ResponseDTOInterface;

class ResendOtpResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly string $pendingOtpToken,
    ) {}

    public function getData(): array
    {
        return [
            'pendingOtpToken' => $this->getPendingOtpToken(),
        ];
    }

    public function getPendingOtpToken(): string
    {
        return $this->pendingOtpToken;
    }
}
