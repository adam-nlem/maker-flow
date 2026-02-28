<?php

namespace App\DTO\Request\ScriptCallToAction;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\CallToActionType;
use App\Entity\ScriptCallToAction;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptCallToActionRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private CallToActionType $callToActionType;
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
        $this->callToActionType = CallToActionType::tryFrom($payload["callToActionType"] ?? "") ?? CallToActionType::Custom;
        $this->position = $payload["position"] ?? null;
        $this->generationUuid = $payload["generationUuid"] ?? null;
    }

    protected function buildObject(): ScriptCallToAction
    {
        $callToAction = new ScriptCallToAction();

        return $callToAction
            ->setContent($this->getContent())
            ->setCallToActionType($this->getCallToActionType());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getCallToActionType(): CallToActionType
    {
        return $this->callToActionType;
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
