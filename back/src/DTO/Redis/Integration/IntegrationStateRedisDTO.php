<?php

namespace App\DTO\Redis\Integration;

use App\Entity\Enum\IntegrationProvider;

class IntegrationStateRedisDTO
{
    public function __construct(
        private readonly string $userUuid,
        private readonly string $projectUuid,
        private readonly IntegrationProvider $provider,
    ) {}

    public static function fromJson(string $json): self
    {
        $data = json_decode($json, true);

        return new self(
            userUuid: $data['userUuid'],
            projectUuid: $data['projectUuid'],
            provider: IntegrationProvider::from($data['provider']),
        );
    }

    public function toJson(): string
    {
        return json_encode([
            'userUuid' => $this->userUuid,
            'projectUuid' => $this->projectUuid,
            'provider' => $this->provider->value,
        ]);
    }

    public function getUserUuid(): string
    {
        return $this->userUuid;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
    }
}
