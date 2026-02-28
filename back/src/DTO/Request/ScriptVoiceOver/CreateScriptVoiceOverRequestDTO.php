<?php

namespace App\DTO\Request\ScriptVoiceOver;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Tone;
use App\Entity\ScriptVoiceOver;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptVoiceOverRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private Tone $tone;
    private ?int $position;
    private ?string $generationUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptUuid = $payload["scriptUuid"];
        $this->content = $payload["content"];
        $this->tone = Tone::tryFrom($payload["tone"] ?? "") ?? Tone::Neutral;
        $this->position = $payload["position"] ?? null;
        $this->generationUuid = $payload["generationUuid"] ?? null;
    }

    protected function buildObject(): ScriptVoiceOver
    {
        $voiceOver = new ScriptVoiceOver();

        return $voiceOver
            ->setContent($this->getContent())
            ->setTone($this->getTone());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getTone(): Tone
    {
        return $this->tone;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function getGenerationUuid(): ?string
    {
        return $this->generationUuid;
    }
}
