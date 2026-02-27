<?php

namespace App\DTO\Request\ScriptRetentionCue;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\RetentionCueType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptRetentionCueRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?RetentionCueType $retentionCueType;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->retentionCueType = isset($payload["retentionCueType"]) ? RetentionCueType::tryFrom($payload["retentionCueType"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
            'retentionCueType' => $this->getRetentionCueType(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getRetentionCueType(): ?RetentionCueType
    {
        return $this->retentionCueType;
    }
}
