<?php

namespace App\DTO\Request\ChatMessage;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\ChatAction;
use App\Entity\Enum\MessageType;
use App\Entity\Message;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateChatMessageRequestDTO extends AbstractRequestDTO
{
    private string $chatUuid;
    private string $content;
    private ?ChatAction $chatAction;
    private ?string $parentMessageUuid;
    private ?array $metadata;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->chatUuid = $payload["chatUuid"];
        $this->content = $payload["content"];
        $this->chatAction = isset($payload["chatAction"]) ? ChatAction::from($payload["chatAction"]) : null;
        $this->parentMessageUuid = $payload["parentMessageUuid"] ?? null;
        $this->metadata = $payload["metadata"] ?? null;
    }

    protected function buildObject(): Message
    {
        return (new Message())
            ->setContent($this->content)
            ->setType(MessageType::User)
            ->setMetadata($this->metadata);
    }

    public function getChatUuid(): string
    {
        return $this->chatUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getChatAction(): ?ChatAction
    {
        return $this->chatAction;
    }

    public function getParentMessageUuid(): ?string
    {
        return $this->parentMessageUuid;
    }

    public function getMetadata(): ?array
    {
        return $this->metadata;
    }
}
