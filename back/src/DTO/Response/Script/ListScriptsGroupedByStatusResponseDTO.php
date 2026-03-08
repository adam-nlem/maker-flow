<?php

namespace App\DTO\Response\Script;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class ListScriptsGroupedByStatusResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        #[Groups([
            'api_scripts_by_status'
        ])]
        private readonly string $status,
        /** @var \App\Entity\Script[] $scripts */
        #[Groups([
            'api_scripts_by_status'
        ])]
        private readonly array $scripts,
    ) {}

    public function getData(): array
    {
        return [
            'status' => $this->status,
            'scripts' => $this->scripts,
        ];
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function getScripts(): array
    {
        return $this->scripts;
    }
}
