<?php

namespace App\DTO\Request\PostDraft;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdatePostDraftRequestDTO extends AbstractRequestDTO
{
    private ?string $title = null;
    private ?string $description = null;
    private ?string $notes = null;
    private ?string $scriptUuid = null;
    private array $presentFields = [];

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload)
    {
        if (array_key_exists("title", $payload)) {
            $this->title = $payload["title"];
            $this->presentFields["title"] = true;
        }

        if (array_key_exists("description", $payload)) {
            $this->description = $payload["description"];
            $this->presentFields["description"] = true;
        }

        if (array_key_exists("notes", $payload)) {
            $this->notes = $payload["notes"];
            $this->presentFields["notes"] = true;
        }

        if (array_key_exists("scriptUuid", $payload)) {
            $this->scriptUuid = $payload["scriptUuid"];
            $this->presentFields["scriptUuid"] = true;
        }
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'description' => $this->getDescription(),
            'notes' => $this->getNotes(),
            'scriptUuid' => $this->getScriptUuid(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getNotes(): ?string
    {
        return $this->notes;
    }

    public function getScriptUuid(): ?string
    {
        return $this->scriptUuid;
    }

    public function hasTitle(): bool
    {
        return isset($this->presentFields["title"]);
    }

    public function hasDescription(): bool
    {
        return isset($this->presentFields["description"]);
    }

    public function hasNotes(): bool
    {
        return isset($this->presentFields["notes"]);
    }

    public function hasScriptUuid(): bool
    {
        return isset($this->presentFields["scriptUuid"]);
    }
}
