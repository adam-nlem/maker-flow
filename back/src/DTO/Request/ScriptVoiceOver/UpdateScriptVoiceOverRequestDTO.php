<?php

namespace App\DTO\Request\ScriptVoiceOver;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Tone;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptVoiceOverRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?Tone $tone;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->tone = isset($payload["tone"]) ? Tone::tryFrom($payload["tone"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
            'tone' => $this->getTone(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getTone(): ?Tone
    {
        return $this->tone;
    }
}
