<?php

namespace App\DTO\Request\DialogueSubject;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateDialogueSubjectRequestDTO extends AbstractRequestDTO
{
    private ?string $speaker;
    private ?string $content;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->speaker = $payload["speaker"] ?? null;
        $this->content = $payload["content"] ?? null;
    }

    protected function buildObject(): array
    {
        return [
            'speaker' => $this->getSpeaker(),
            'content' => $this->getContent(),
        ];
    }

    public function getSpeaker(): ?string
    {
        return $this->speaker;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }
}
