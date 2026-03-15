<?php

namespace App\DTO\Response\Prelaunch;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class AuthenticatePrelaunchResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_prelaunch_authenticate'])]
        private readonly string $pendingOtpToken,
        #[Groups(['api_prelaunch_authenticate'])]
        private readonly string $email,
    ) {}

    public function getData(): array
    {
        return [
            'pendingOtpToken' => $this->getPendingOtpToken(),
            'email' => $this->getEmail(),
        ];
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
