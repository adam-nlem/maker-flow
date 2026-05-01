<?php

namespace App\DTO\Request\ScriptPart;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ScriptPartType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptPartRequestDTO extends AbstractRequestDTO
{
    private ?string $content = null;
    private ?ScriptPartType $type = null;
    private ?int $position = null;
    private bool $hasContent = false;
    private bool $hasType = false;
    private bool $hasPosition = false;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        if (array_key_exists('content', $payload)) {
            $this->content = $payload['content'];
            $this->hasContent = true;
        }
        if (array_key_exists('type', $payload)) {
            $this->type = ScriptPartType::tryFrom($payload['type']);
            $this->hasType = $this->type !== null;
        }
        if (array_key_exists('position', $payload)) {
            $this->position = (int) $payload['position'];
            $this->hasPosition = true;
        }
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->content,
            'type' => $this->type,
            'position' => $this->position,
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getType(): ?ScriptPartType
    {
        return $this->type;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function hasContent(): bool
    {
        return $this->hasContent;
    }

    public function hasType(): bool
    {
        return $this->hasType;
    }

    public function hasPosition(): bool
    {
        return $this->hasPosition;
    }
}
