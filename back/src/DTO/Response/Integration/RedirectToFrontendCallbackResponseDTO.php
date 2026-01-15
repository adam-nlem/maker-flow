<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\IntegrationProvider;
use App\Entity\Enum\OAuthCallbackStatus;
use App\Entity\Enum\OAuthErrorCode;

class RedirectToFrontendCallbackResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private OAuthCallbackStatus $status,
        private IntegrationProvider $provider,
        private ?OAuthErrorCode $errorCode,
        private ?string $integrationUuid,
    ) {}

    public function getData(): array
    {
        return [
            'status' => $this->getStatus()->value,
            'provider' => $this->getProvider()->value,
            'error_code' => $this->getErrorCode()?->value,
            'integration_uuid' => $this->getIntegrationUuid(),
        ];
    }

    public function getStatus(): OAuthCallbackStatus
    {
        return $this->status;
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
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
