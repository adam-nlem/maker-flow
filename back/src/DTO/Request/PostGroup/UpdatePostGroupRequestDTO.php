<?php

namespace App\DTO\Request\PostGroup;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdatePostGroupRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    /** @var string[]|null */
    private ?array $addPostUuids;
    /** @var string[]|null */
    private ?array $removePostUuids;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->addPostUuids = $payload["addPostUuids"] ?? null;
        $this->removePostUuids = $payload["removePostUuids"] ?? null;
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'addPostUuids' => $this->getAddPostUuids(),
            'removePostUuids' => $this->getRemovePostUuids(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    /**
     * @return string[]|null
     */
    public function getAddPostUuids(): ?array
    {
        return $this->addPostUuids;
    }

    /**
     * @return string[]|null
     */
    public function getRemovePostUuids(): ?array
    {
        return $this->removePostUuids;
    }
}
