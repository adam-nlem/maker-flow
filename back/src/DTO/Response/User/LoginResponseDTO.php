<?php

namespace App\DTO\Response\User;

use App\DTO\Response\ResponseDTOInterface;

class LoginResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly bool $requiresOtp,
        private readonly bool $requiresEmailVerification,
        private readonly string $pendingOtpToken,
        private readonly ?string $email = null,
    ) {}

    public function getData(): array
    {
        return [
            'requiresOtp' => $this->getRequiresOtp(),
            'requiresEmailVerification' => $this->getRequiresEmailVerification(),
            'pendingOtpToken' => $this->getPendingOtpToken(),
            'email' => $this->getEmail(),
        ];
    }

    public function getRequiresOtp(): bool
    {
        return $this->requiresOtp;
    }

    public function getRequiresEmailVerification(): bool
    {
        return $this->requiresEmailVerification;
    }

    public function getPendingOtpToken(): string
    {
        return $this->pendingOtpToken;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }
}
