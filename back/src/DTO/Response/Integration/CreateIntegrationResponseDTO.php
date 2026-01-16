<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;

class CreateIntegrationResponseDTO implements ResponseDTOInterface
{
    public function __construct(
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
