<?php

namespace App\DTO\Request\TargetAudience;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\TargetAudience;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateTargetAudienceRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $name;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->name = $payload["name"];
    }

    protected function buildObject(): TargetAudience
    {
        return (new TargetAudience())
            ->setName($this->name);
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getName(): string
    {
        return $this->name;
    }
}
