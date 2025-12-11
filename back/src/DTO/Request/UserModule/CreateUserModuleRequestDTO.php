<?php

namespace App\DTO\Request\UserModule;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateUserModuleRequestDTO extends AbstractRequestDTO
{
    private string $moduleUuid;
    private string $projectUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->moduleUuid = $payload["moduleUuid"];
        $this->projectUuid = $payload["projectUuid"];
    }

    public function buildObject(): mixed
    {
        return [
            'moduleUuid' => $this->getModuleUuid(),
            'projectUuid' => $this->getProjectUuid()
        ];
    }

    public function getModuleUuid(): string
    {
        return $this->moduleUuid;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }
}
