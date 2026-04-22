<?php

namespace App\DTO\Request\ScriptVersion;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ApplyHookSuggestionRequestDTO extends AbstractRequestDTO
{
    private string $chatUuid;
    private string $messageUuid;
    private string $hookContent;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->chatUuid = $payload["chatUuid"];
        $this->messageUuid = $payload["messageUuid"];
        $this->hookContent = $payload["hookContent"];
    }

    protected function buildObject(): mixed
    {
        return null;
    }

    public function getChatUuid(): string
    {
        return $this->chatUuid;
    }

    public function getMessageUuid(): string
    {
        return $this->messageUuid;
    }

    public function getHookContent(): string
    {
        return $this->hookContent;
    }
}
