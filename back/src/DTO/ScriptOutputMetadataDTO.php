<?php

namespace App\DTO;

class ScriptOutputMetadataDTO
{
    public function __construct(
        private readonly ?string $title,
        private readonly ?string $hook,
    ) {}

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getHook(): ?string
    {
        return $this->hook;
    }
}
