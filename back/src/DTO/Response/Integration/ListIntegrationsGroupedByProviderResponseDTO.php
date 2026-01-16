<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\IntegrationProvider;
use Symfony\Component\Serializer\Attribute\Groups;

class ListIntegrationsGroupedByProviderResponseDTO implements ResponseDTOInterface
{

    public function __construct(
        #[Groups([
            'api_integrations_list'
        ])]
        private IntegrationProvider $provider,
        /** @var Integration[] $integrations */
        #[Groups([
            'api_integrations_list'
        ])]
        private array $integrations,
    ) {}

    public function getData(): array
    {
        return [
            'provider' => $this->getProvider()->value,
            'integrations' => $this->getIntegrations(),
        ];
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
    }

    public function getIntegrations(): array
    {
        return $this->integrations;
    }
}
