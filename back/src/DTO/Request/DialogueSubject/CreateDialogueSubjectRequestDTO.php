<?php

namespace App\DTO\Request\DialogueSubject;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\DialogueSubject;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateDialogueSubjectRequestDTO extends AbstractRequestDTO
{
    private string $scriptDialogueUuid;
    private string $speaker;
    private string $content;
    private ?int $position;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->scriptDialogueUuid = $payload["scriptDialogueUuid"];
        $this->speaker = $payload["speaker"];
        $this->content = $payload["content"];
        $this->position = $payload["position"] ?? null;
    }

    protected function buildObject(): DialogueSubject
    {
        $subject = new DialogueSubject();

        return $subject
            ->setSpeaker($this->getSpeaker())
            ->setContent($this->getContent());
    }

    public function getScriptDialogueUuid(): string
    {
        return $this->scriptDialogueUuid;
    }

    public function getSpeaker(): string
    {
        return $this->speaker;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }
}
