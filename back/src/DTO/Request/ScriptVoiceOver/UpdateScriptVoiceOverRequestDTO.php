<?php

namespace App\DTO\Request\ScriptVoiceOver;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\VoiceOverType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptVoiceOverRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?VoiceOverType $voiceOverType;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->voiceOverType = isset($payload["voiceOverType"]) ? VoiceOverType::tryFrom($payload["voiceOverType"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
            'voiceOverType' => $this->getVoiceOverType(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getVoiceOverType(): ?VoiceOverType
    {
        return $this->voiceOverType;
    }
}
