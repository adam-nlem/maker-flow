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
    /** @var ?ProjectType[] */
    private ?array $types;

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
        $this->types = isset($payload["types"]) ? array_map(
            fn(string $type) => ProjectType::from($type),
            $payload["types"] ?? []
        ) : null;
    }

    public function buildObject(): array
    {
        return [
            'name' => $this->getName(),
            'description' => $this->getDescription(),
            'types' => $this->getTypes()
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

    /**
     * @return ?ProjectType[]
     */
    public function getTypes(): ?array
    {
        return $this->types;
    }
}
