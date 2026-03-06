<?php

namespace App\DTO\Request\PostGroup;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\PostGroup;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreatePostGroupRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;
    /** @var string[] */
    private array $postUuids;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->title = $payload["title"];
        $this->postUuids = $payload["postUuids"] ?? [];
    }

    protected function buildObject(): PostGroup
    {
        return (new PostGroup())
            ->setTitle($this->getTitle());
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    /**
     * @return string[]
     */
    public function getPostUuids(): array
    {
        return $this->postUuids;
    }
}
