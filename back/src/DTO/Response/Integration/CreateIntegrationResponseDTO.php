<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;

class CreateIntegrationResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups(['api_integrations_create'])]
        private string $authorizationUrl,
    ) {}

    public function getData(): array
    {
        return [
            'authorization_url' => $this->getAuthorizationUrl(),
        ];
    }

    public function getAuthorizationUrl(): string
    {
        return $this->authorizationUrl;
    }
}
