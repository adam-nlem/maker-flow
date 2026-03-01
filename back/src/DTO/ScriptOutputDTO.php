<?php

namespace App\DTO;

class ScriptOutputDTO
{
    /**
     * @param ScriptOutputPartDTO[] $parts
     */
    public function __construct(
        private readonly ?string $title,
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
            parts: $parts,
        );
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    /**
     * @return ScriptOutputPartDTO[]
     */
    public function getParts(): array
    {
        return $this->parts;
    }
}
