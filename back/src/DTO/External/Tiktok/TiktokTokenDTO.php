<?php

namespace App\DTO\External\Tiktok;

class TiktokTokenDTO
{
    public function __construct(
        private readonly string $accessToken,
        private readonly int $expiresIn,
        private readonly string $openId,
        private readonly string $refreshToken,
        private readonly int $refreshExpiresIn,
        private readonly string $scope,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            accessToken: $data['access_token'],
            expiresIn: $data['expires_in'],
            openId: $data['open_id'],
            refreshToken: $data['refresh_token'],
            refreshExpiresIn: $data['refresh_expires_in'],
            scope: $data['scope'],
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

    public function getOpenId(): string
    {
        return $this->openId;
    }

    public function getRefreshToken(): string
    {
        return $this->refreshToken;
    }

    public function getRefreshExpiresIn(): int
    {
        return $this->refreshExpiresIn;
    }

    public function getScope(): string
    {
        return $this->scope;
    }
}
