<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?string $publishedAt;
    private ?string $postGroupUuid;
    private ?array $tagUuids;
    private ?array $platforms;
    private ?string $status;
    private bool $hasPostGroupUuid = false;
    private bool $hasPlatforms = false;
    private bool $hasStatus = false;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->publishedAt = $payload["publishedAt"] ?? null;
        $this->postGroupUuid = $payload["postGroupUuid"] ?? null;
        $this->hasPostGroupUuid = array_key_exists("postGroupUuid", $payload);
        $this->tagUuids = $payload["tagUuids"] ?? null;
        $this->platforms = $payload["platforms"] ?? null;
        $this->hasPlatforms = array_key_exists("platforms", $payload);
        $this->status = $payload["status"] ?? null;
        $this->hasStatus = array_key_exists("status", $payload);
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'publishedAt' => $this->getPublishedAt(),
            'postGroupUuid' => $this->getPostGroupUuid(),
            'tagUuids' => $this->getTagUuids(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
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

    public function getPlatforms(): ?array
    {
        return $this->platforms;
    }

    public function hasPlatforms(): bool
    {
        return $this->hasPlatforms;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function hasStatus(): bool
    {
        return $this->hasStatus;
    }
}
