<?php

namespace App\DTO;

class ScriptOutputDTO
{
    /**
     * @param ScriptOutputPartDTO[] $parts
     */
    public function __construct(
        private readonly ?string $title,
        private readonly ?string $hook,
        private readonly array $parts,
    ) {}

    public static function fromArray(array $data): self
    {
        $parts = array_map(
            fn(array $partData) => ScriptOutputPartDTO::fromArray($partData),
            $data['parts'] ?? [],
        );

        return new self(
            title: isset($data['title']) && $data['title'] !== '' ? trim($data['title']) : null,
            hook: isset($data['hook']) && $data['hook'] !== '' ? trim($data['hook']) : null,
            parts: $parts,
        );
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getHook(): ?string
    {
        return $this->hook;
    }

    /**
     * @return ScriptOutputPartDTO[]
     */
    public function getParts(): array
    {
        return $this->parts;
    }
}
