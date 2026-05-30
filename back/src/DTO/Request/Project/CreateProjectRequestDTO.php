<?php

namespace App\DTO\Request\Project;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ProjectType;
use App\Entity\Project;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateProjectRequestDTO extends AbstractRequestDTO
{
    private string $name;
    private ?string $description;
    /** @var ProjectType[] */
    private array $types;
    private File $logo;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct(
            $requestStack,
            $validator,
            $requestStack->getCurrentRequest()->request->all(),
        );
    }

    public function fromPayload(array $payload)
    {
        $this->name  = $payload["name"];
        $this->description = $payload["description"] ?? null;
        $this->types = array_map(
            fn(string $type) => ProjectType::from($type),
            $payload["types"] ?? []
        );

        $this->logo = $this->requestStack->getCurrentRequest()->files->get('logo');
    }

    public function buildObject(): Project
    {
        $project = new Project();

        return $project
            ->setName($this->getName())
            ->setDescription($this->getDescription())
            ->setTypes($this->getTypes());
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    /**
     * @return ProjectType[]
     */
    public function getTypes(): array
    {
        return $this->types;
    }

    public function getLogo(): File
    {
        return $this->logo;
    }
}
