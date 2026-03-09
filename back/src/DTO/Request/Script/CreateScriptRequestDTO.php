<?php

namespace App\DTO\Request\Script;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Platform;
use App\Entity\Enum\ScriptStatus;
use App\Entity\Script;
use DateTimeImmutable;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;
    private ?DateTimeImmutable $publishedAt;
    private ?string $postGroupUuid;
    private ?array $tagUuids;
    private ?array $platforms;
    private ?ScriptStatus $status;

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
        $this->publishedAt = isset($payload["publishedAt"]) ? new \DateTimeImmutable($payload["publishedAt"]) : null;
        $this->postGroupUuid = $payload["postGroupUuid"] ?? null;
        $this->tagUuids = $payload["tagUuids"] ?? null;
        $this->platforms = isset($payload["platforms"])
            ? array_filter(array_map(fn(string $platform) => Platform::tryFrom($platform), $payload["platforms"]))
            : null;
        $this->status = isset($payload["status"]) ? (ScriptStatus::tryFrom($payload["status"]) ?? ScriptStatus::Idea) : ScriptStatus::Idea;
    }

    protected function buildObject(): Script
    {
        $script = new Script();
        $script->setTitle($this->getTitle())
            ->setPlatforms($this->getPlatforms())
            ->setStatus($this->getStatus())
            ->setPublishedAt($this->getPublishedAt());

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

    public function getPublishedAt(): ?DateTimeImmutable
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

    public function getPlatforms(): ?array
    {
        return $this->platforms;
    }

    public function getStatus(): ScriptStatus
    {
        return $this->status;
    }
}
