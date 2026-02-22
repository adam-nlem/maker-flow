<?php

namespace App\DTO\Redis\Integration;

use App\Entity\Enum\Platform;

class IntegrationStateRedisDTO
{
    public function __construct(
        private readonly string $userUuid,
        private readonly string $projectUuid,
        private readonly Platform $platform,
    ) {}

    public static function fromJson(string $json): self
    {
        $data = json_decode($json, true);

        return new self(
            userUuid: $data['userUuid'],
            projectUuid: $data['projectUuid'],
            platform: Platform::from($data['platform']),
        );
    }

    public function toJson(): string
    {
        return json_encode([
            'userUuid' => $this->userUuid,
            'projectUuid' => $this->projectUuid,
            'platform' => $this->platform->value,
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

    public function getPlatform(): Platform
    {
        return $this->platform;
    }
}
