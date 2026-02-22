<?php

namespace App\DTO\Request\Integration;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Platform;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateIntegrationRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    #[Assert\NotBlank]
    private Platform $platform;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->platform = Platform::from($payload["platform"]);
    }

    protected function buildObject(): mixed
    {
        return null;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getPlatform(): Platform
    {
        return $this->platform;
    }
}
