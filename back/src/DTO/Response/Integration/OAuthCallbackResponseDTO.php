<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\Platform;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;

class OAuthCallbackResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private OAuthCallbackStatus $status,
        private Platform $platform,
        private ?OAuthErrorCode $errorCode,
        private ?string $integrationUuid,
    ) {}

    public function getData(): array
    {
        return [
            'status' => $this->getStatus()->value,
            'platform' => $this->getPlatform()->value,
            'error_code' => $this->getErrorCode()?->value,
            'integration_uuid' => $this->getIntegrationUuid(),
        ];
    }

    public function getStatus(): OAuthCallbackStatus
    {
        return $this->status;
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }

    public function getErrorCode(): ?OAuthErrorCode
    {
        return $this->errorCode;
    }

    public function getIntegrationUuid(): ?string
    {
        return $this->integrationUuid;
    }
}
