<?php

namespace App\DTO\Request\Invitation;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\InvitationType;
use App\Entity\Enum\UserRole;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateInvitationRequestDTO extends AbstractRequestDTO
{
    private ?InvitationType $type = null;

    #[Assert\NotBlank]
    #[Assert\Email]
    private string $email;

    #[Assert\NotBlank]
    private string $firstName;

    #[Assert\NotBlank]
    private string $lastName;

    private ?UserRole $role = null;

    #[Assert\Uuid]
    private ?string $projectUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->type = isset($payload['type']) ? InvitationType::tryFrom($payload['type']) : null;
        $this->email = $payload['email'];
        $this->firstName = $payload['firstName'];
        $this->lastName = $payload['lastName'];
        $this->role = isset($payload['role']) ? UserRole::tryFrom($payload['role']) : null;
        $this->projectUuid = $payload['projectUuid'] ?? null;
    }

    protected function buildObject(): mixed
    {
        return [
            'type' => $this->getType(),
            'email' => $this->getEmail(),
            'firstName' => $this->getFirstName(),
            'lastName' => $this->getLastName(),
            'role' => $this->getRole(),
            'projectUuid' => $this->getProjectUuid(),
        ];
    }

    public function getType(): ?InvitationType
    {
        return $this->type;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getFirstName(): string
    {
        return $this->firstName;
    }

    public function getLastName(): string
    {
        return $this->lastName;
    }

    public function getRole(): ?UserRole
    {
        return $this->role;
    }

    public function getProjectUuid(): ?string
    {
        return $this->projectUuid;
    }
}
