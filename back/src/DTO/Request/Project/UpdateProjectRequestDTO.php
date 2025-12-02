<?php

namespace App\DTO\Request\Project;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ProjectType;
use App\Entity\Project;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateProjectRequestDTO extends AbstractRequestDTO
{
    private ?string $name;
    private ?string $description;
    private ?ProjectType $type;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->name = $payload["name"] ?? null;
        $this->description = $payload["description"] ?? null;
        $this->type = isset($payload["type"]) ? ProjectType::from($payload["type"]) : null;
    }

    public function buildObject(): array
    {
        return [
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'type' => $this->getType()
        ];
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getType(): ?ProjectType
    {
        return $this->type;
    }
}
