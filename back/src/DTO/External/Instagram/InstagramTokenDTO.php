<?php

namespace App\DTO\External\Instagram;

class InstagramTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'] ?? 5184000,
        );
    }

    public function getAccessToken(): string
    {
        return $this->accessToken;
    }

    public function getExpiresIn(): int
    {
        return $this->expiresIn;
    }
}
