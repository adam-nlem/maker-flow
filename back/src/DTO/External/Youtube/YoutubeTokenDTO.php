<?php

namespace App\DTO\External\Youtube;

class YoutubeTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
        private readonly ?string $refreshToken,
        private readonly string $scope,
        private readonly ?int $refreshTokenExpiresIn,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'],
            refreshToken: $data['refresh_token'] ?? null,
            scope: $data['scope'],
            refreshTokenExpiresIn: $data['refresh_token_expires_in'] ?? null,
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

    public function getRefreshToken(): ?string
    {
        return $this->refreshToken;
    }

    public function getScope(): string
    {
        return $this->scope;
    }

    public function getRefreshTokenExpiresIn(): ?int
    {
        return $this->refreshTokenExpiresIn;
    }
}
