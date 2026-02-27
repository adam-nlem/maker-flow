<?php

namespace App\DTO\Request\ScriptCallToAction;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\CallToActionType;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptCallToActionRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?CallToActionType $callToActionType;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->callToActionType = isset($payload["callToActionType"]) ? CallToActionType::tryFrom($payload["callToActionType"]) : null;
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
            'callToActionType' => $this->getCallToActionType(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getCallToActionType(): ?CallToActionType
    {
        return $this->callToActionType;
    }
}
