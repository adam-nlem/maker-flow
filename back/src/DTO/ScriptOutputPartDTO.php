<?php

namespace App\DTO;

class ScriptOutputPartDTO
{
    public function __construct(
        private readonly string $type,
        private readonly ?string $title,
        private readonly ?string $description,
        private readonly ?string $content,
        private readonly ?string $callToActionType,
        private readonly ?string $retentionCueType,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            type: $data['type'] ?? 'text',
            title: $data['title'] ?? null,
            description: $data['description'] ?? null,
            content: $data['content'] ?? null,
            callToActionType: $data['callToActionType'] ?? null,
            retentionCueType: $data['retentionCueType'] ?? null,
        );
    }

    public function getType(): string
    {
        return $this->type;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getCallToActionType(): ?string
    {
        return $this->callToActionType;
    }

    public function getRetentionCueType(): ?string
    {
        return $this->retentionCueType;
    }
}
