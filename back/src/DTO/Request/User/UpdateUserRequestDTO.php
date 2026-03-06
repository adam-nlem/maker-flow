<?php

namespace App\DTO\Request\User;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateUserRequestDTO extends AbstractRequestDTO
{
    private ?string $firstName;
    private ?string $lastName;
    private ?string $currentPassword;
    private ?string $newPassword;
    private ?string $confirmNewPassword;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload): void
    {
        $this->firstName = $payload['firstName'] ?? null;
        $this->lastName = $payload['lastName'] ?? null;
        $this->currentPassword = $payload['currentPassword'] ?? null;
        $this->newPassword = $payload['newPassword'] ?? null;
        $this->confirmNewPassword = $payload['confirmNewPassword'] ?? null;
    }

    public function buildObject(): array
    {
        return [];
    }

    public function getFirstName(): ?string
    {
        return $this->firstName;
    }

    public function getLastName(): ?string
    {
        return $this->lastName;
    }

    public function getCurrentPassword(): ?string
    {
        return $this->currentPassword;
    }

    public function getNewPassword(): ?string
    {
        return $this->newPassword;
    }

    public function getConfirmNewPassword(): ?string
    {
        return $this->confirmNewPassword;
    }
}
