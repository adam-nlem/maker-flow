<?php

namespace App\DTO\Request\ScriptDialogue;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\ScriptDialogue;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptDialogueRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $title;
    private ?string $description;
    private ?int $position;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->title = $payload["title"];
        $this->description = $payload["description"] ?? null;
        $this->position = $payload["position"] ?? null;
    }

    protected function buildObject(): ScriptDialogue
    {
        $dialogue = new ScriptDialogue();

        $dialogue->setTitle($this->getTitle());

        if ($this->getDescription() !== null) {
            $dialogue->setDescription($this->getDescription());
        }

        return $dialogue;
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }
}
