<?php

namespace App\DTO\Response\User;

use App\DTO\Response\ResponseDTOInterface;

class RegisterResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly bool $requiresEmailVerification,
        private readonly string $pendingOtpToken,
        private readonly string $email,
    ) {}

    public function getData(): array
    {
        return [
            'requiresEmailVerification' => $this->getRequiresEmailVerification(),
            'pendingOtpToken' => $this->getPendingOtpToken(),
            'email' => $this->getEmail(),
        ];
    }

    public function getRequiresEmailVerification(): bool
    {
        return $this->requiresEmailVerification;
    }

    public function getPendingOtpToken(): string
    {
        return $this->pendingOtpToken;
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
