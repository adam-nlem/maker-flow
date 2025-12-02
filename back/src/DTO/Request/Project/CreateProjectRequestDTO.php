<?php

namespace App\DTO\Request\Project;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ProjectType;
use App\Entity\Project;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateProjectRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private ?string $description;
    private ProjectType $type;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->name  = $payload["name"];
        $this->description = isset($payload["description"]) ? $payload["description"] : null;
        $this->type = ProjectType::from($payload["type"]);
    }

    public function buildObject(): Project
    {
        $project = new Project();

        return $project
            ->setName($this->getName())
            ->setDescription($this->getDescription())
            ->setType($this->getType());
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getType(): ProjectType
    {
        return $this->type;
    }
}
