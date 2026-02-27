<?php

namespace App\DTO\Request\ScriptRetentionCue;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\RetentionCueType;
use App\Entity\ScriptRetentionCue;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptRetentionCueRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private RetentionCueType $retentionCueType;
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
        $this->content = $payload["content"];
        $this->retentionCueType = RetentionCueType::tryFrom($payload["retentionCueType"] ?? "") ?? RetentionCueType::Question;
        $this->position = $payload["position"] ?? null;
    }

    protected function buildObject(): ScriptRetentionCue
    {
        $retentionCue = new ScriptRetentionCue();

        return $retentionCue
            ->setContent($this->getContent())
            ->setRetentionCueType($this->getRetentionCueType());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getRetentionCueType(): RetentionCueType
    {
        return $this->retentionCueType;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }
}
