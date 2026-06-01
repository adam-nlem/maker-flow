<?php

namespace App\DTO\Request\Invitation;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CompleteInvitationRequestDTO extends AbstractRequestDTO
{
    private string $password;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        $this->password = $payload['password'];
    }

    protected function buildObject(): mixed
    {
        return [
            'password' => $this->getPassword(),
        ];
    }

    public function getPassword(): string
    {
        return $this->password;
    }
}
