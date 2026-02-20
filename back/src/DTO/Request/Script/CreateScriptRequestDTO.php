<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Script;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;
    private ?string $hook;
    private ?string $publishedAt;
    private ?string $postGroupUuid;
    private ?array $tagUuids;

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
        $this->hook = $payload["hook"] ?? null;
        $this->publishedAt = $payload["publishedAt"] ?? null;
        $this->postGroupUuid = $payload["postGroupUuid"] ?? null;
        $this->tagUuids = $payload["tagUuids"] ?? null;
    }

    protected function buildObject(): Script
    {
        $script = new Script();
        $script->setTitle($this->getTitle());

        if ($this->getHook() !== null) {
            $script->setHook($this->getHook());
        }

        if ($this->getPublishedAt() !== null) {
            $script->setPublishedAt(new \DateTimeImmutable($this->getPublishedAt()));
        }

        return $script;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getHook(): ?string
    {
        return $this->hook;
    }

    public function getPublishedAt(): ?string
    {
        return $this->publishedAt;
    }

    public function getPostGroupUuid(): ?string
    {
        return $this->postGroupUuid;
    }

    public function getTagUuids(): ?array
    {
        return $this->tagUuids;
    }
}
