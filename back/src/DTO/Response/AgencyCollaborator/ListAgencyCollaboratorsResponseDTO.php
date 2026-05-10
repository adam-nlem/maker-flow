<?php

namespace App\DTO\Response\AgencyCollaborator;

use App\DTO\Response\ResponseDTOInterface;

class ListAgencyCollaboratorsResponseDTO implements ResponseDTOInterface
{
    public function __construct(
        private readonly iterable $collaborators,
        private readonly iterable $pendingInvitations,
    ) {}

    public function getData(): array
    {
        return [
            'collaborators' => $this->collaborators,
            'pendingInvitations' => $this->pendingInvitations,
        ];
    }
}
