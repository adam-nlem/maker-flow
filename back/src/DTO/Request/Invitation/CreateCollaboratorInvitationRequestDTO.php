<?php

namespace App\DTO\Request\Invitation;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\UserRole;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateCollaboratorInvitationRequestDTO extends AbstractRequestDTO
{
    private string $firstName;
    private string $lastName;
    private string $email;
    private ?UserRole $role = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->firstName = $payload['firstName'];
        $this->lastName = $payload['lastName'];
        $this->email = $payload['email'];
        $this->role = UserRole::tryFrom($payload['role']);
    }

    protected function buildObject(): mixed
    {
        return [
            'firstName' => $this->getFirstName(),
            'lastName' => $this->getLastName(),
            'email' => $this->getEmail(),
            'role' => $this->getRole(),
        ];
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getRole(): ?UserRole
    {
        return $this->role;
    }
}
