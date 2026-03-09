<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Platform;
use App\Entity\Enum\ScriptStatus;
use DateTimeImmutable;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?DateTimeImmutable $publishedAt;
    private ?string $postGroupUuid;
    private ?array $tagUuids;
    private ?array $platforms;
    private ?ScriptStatus $status;
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
        $this->publishedAt = isset($payload["publishedAt"]) ? new \DateTimeImmutable($payload["publishedAt"]) : null;
        $this->postGroupUuid = $payload["postGroupUuid"] ?? null;
        $this->hasPostGroupUuid = array_key_exists("postGroupUuid", $payload);
        $this->tagUuids = $payload["tagUuids"] ?? null;
        $this->platforms = isset($payload["platforms"])
            ? array_filter(array_map(fn(string $platform) => Platform::tryFrom($platform), $payload["platforms"]))
            : null;
        $this->hasPlatforms = array_key_exists("platforms", $payload);
        $this->status = isset($payload["status"]) ? ScriptStatus::tryFrom($payload["status"]) : null;
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

    public function getPublishedAt(): ?DateTimeImmutable
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

    public function getStatus(): ?ScriptStatus
    {
        return $this->status;
    }

    public function hasStatus(): bool
    {
        return $this->hasStatus;
    }
}
