<?php

namespace App\DTO\Response\Project;

use App\DTO\Response\ResponseDTOInterface;

class ListClientsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly iterable $clients,
        private readonly iterable $pendingInvitations,
    ) {}

    public function getData(): array
    {
        return [
            'clients' => $this->clients,
            'pendingInvitations' => $this->pendingInvitations,
        ];
    }
}
