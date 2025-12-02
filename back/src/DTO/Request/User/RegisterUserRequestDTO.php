<?php

namespace App\DTO\Request\User;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\User;
use App\Helper\NormalizerHelper;
use App\Helper\RegexHelper;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RegisterUserRequestDTO extends AbstractRequestDTO
{
    private string $firstName;
    private string $lastName;
    private string $email;
    private string $plainPassword;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
        private readonly UserPasswordHasherInterface $passwordHasher
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->firstName = $payload["firstName"];
        $this->lastName = $payload["lastName"];
        $this->email = $payload["email"];
        $this->plainPassword = $payload["password"];
    }

    public function buildObject(): User
    {
        $user = new User();

        return $user
            ->setFirstName($this->getFirstName())
            ->setLastName($this->getLastName())
            ->setEmail($this->getEmail())
            ->setPassword($this->passwordHasher->hashPassword($user, $this->getPlainPassword()));
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

    public function getPlainPassword(): string
    {
        return $this->plainPassword;
    }
}
