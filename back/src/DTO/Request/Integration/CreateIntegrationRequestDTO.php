<?php

namespace App\DTO\Request\Integration;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\IntegrationProvider;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateIntegrationRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    private string $userModuleUuid;

    #[Assert\NotBlank]
    private IntegrationProvider $provider;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->userModuleUuid = $payload["userModuleUuid"];
        $this->provider = IntegrationProvider::from($payload["provider"]);
    }

    protected function buildObject(): mixed
    {
        return null;
    }

    public function getUserModuleUuid(): string
    {
        return $this->userModuleUuid;
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
    }
}
