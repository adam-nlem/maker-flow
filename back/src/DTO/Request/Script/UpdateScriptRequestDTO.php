<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?string $hook;
    private ?string $publishedAt;
    private ?string $postGroupUuid;
    private ?array $tagUuids;
    private bool $hasPostGroupUuid = false;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->hook = $payload["hook"] ?? null;
        $this->publishedAt = $payload["publishedAt"] ?? null;
        $this->postGroupUuid = $payload["postGroupUuid"] ?? null;
        $this->hasPostGroupUuid = array_key_exists("postGroupUuid", $payload);
        $this->tagUuids = $payload["tagUuids"] ?? null;
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'hook' => $this->getHook(),
            'publishedAt' => $this->getPublishedAt(),
            'postGroupUuid' => $this->getPostGroupUuid(),
            'tagUuids' => $this->getTagUuids(),
        ];
    }

    public function getTitle(): ?string
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

    public function hasPostGroupUuid(): bool
    {
        return $this->hasPostGroupUuid;
    }

    public function getTagUuids(): ?array
    {
        return $this->tagUuids;
    }
}
