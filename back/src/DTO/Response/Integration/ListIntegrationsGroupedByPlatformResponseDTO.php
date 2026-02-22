<?php

namespace App\DTO\Response\Integration;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\Platform;
use Symfony\Component\Serializer\Attribute\Groups;

class ListIntegrationsGroupedByPlatformResponseDTO implements ResponseDTOInterface
{

    public function __construct(
        #[Groups([
            'api_integrations_list'
        ])]
        private Platform $platform,
        /** @var Integration[] $integrations */
        #[Groups([
            'api_integrations_list'
        ])]
        private array $integrations,
    ) {}

    public function getData(): array
    {
        return [
            'platform' => $this->getPlatform()->value,
            'integrations' => $this->getIntegrations(),
        ];
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }

    public function getIntegrations(): array
    {
        return $this->integrations;
    }
}
