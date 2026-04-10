<?php

namespace App\DTO\External\Tiktok;

class TiktokUserProfileDTO
{
    public function __construct(
        private readonly string $openId,
        private readonly ?string $displayName,
        private readonly ?string $avatarUrl,
        private readonly ?string $username,
    ) {}

    public static function fromArray(array $data): self
    {
        $user = $data['data']['user'];

        return new self(
            openId: $user['open_id'],
            displayName: $user['display_name'] ?? null,
            avatarUrl: $user['avatar_url'] ?? null,
            username: $user['username'] ?? null,
        );
    }

    public function getOpenId(): string
    {
        return $this->openId;
    }

    public function getDisplayName(): ?string
    {
        return $this->displayName;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatarUrl;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }
}
