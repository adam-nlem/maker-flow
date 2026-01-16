<?php

namespace App\DTO\Redis\Integration;

use App\Entity\Enum\IntegrationProvider;

class IntegrationStateRedisDTO
{
    public function __construct(
        private readonly string $userUuid,
        private readonly string $userModuleUuid,
        private readonly IntegrationProvider $provider,
    ) {}

    public static function fromJson(string $json): self
    {
        $data = json_decode($json, true);

        return new self(
            userUuid: $data['userUuid'],
            userModuleUuid: $data['userModuleUuid'],
            provider: IntegrationProvider::from($data['provider']),
        );
    }

    public function toJson(): string
    {
        return json_encode([
            'userUuid' => $this->userUuid,
            'userModuleUuid' => $this->userModuleUuid,
            'provider' => $this->provider->value,
        ]);
    }

    public function getUserUuid(): string
    {
        return $this->userUuid;
    }

    public function getUserModuleUuid(): string
    {
        return $this->userModuleUuid;
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
    }
}
