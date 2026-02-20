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
    private string $projectUuid;

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
        $this->projectUuid = $payload["projectUuid"];
        $this->provider = IntegrationProvider::from($payload["provider"]);
    }

    protected function buildObject(): mixed
    {
        return null;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getProvider(): IntegrationProvider
    {
        return $this->provider;
    }
}
