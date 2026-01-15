<?php

namespace App\DTO\External\Instagram;

class InstagramUserProfileDTO
{
    public function __construct(
        private readonly string $userId,
        private readonly string $username,
        private readonly ?string $name,
        private readonly ?string $profilePictureUrl,
        private readonly ?string $accountType,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            userId: $data['user_id'],
            username: $data['username'],
            name: $data['name'] ?? null,
            profilePictureUrl: $data['profile_picture_url'] ?? null,
            accountType: $data['account_type'] ?? null,
        );
    }

    public function getUserId(): string
    {
        return $this->userId;
    }

    public function getUsername(): string
    {
        return $this->username;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getProfilePictureUrl(): ?string
    {
        return $this->profilePictureUrl;
    }

    public function getAccountType(): ?string
    {
        return $this->accountType;
    }
}
