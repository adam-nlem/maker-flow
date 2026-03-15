<?php

namespace App\DTO\Request\Prelaunch;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthenticatePrelaunchRequestDTO extends AbstractRequestDTO
{
    private string $email;
    private ?string $referralCode = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->email = $payload["email"];
        $this->referralCode = $payload["referralCode"] ?? null;
    }

    public function buildObject(): mixed
    {
        return null;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getReferralCode(): ?string
    {
        return $this->referralCode;
    }
}
