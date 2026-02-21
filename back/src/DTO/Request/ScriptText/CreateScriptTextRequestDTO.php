<?php

namespace App\DTO\Request\ScriptText;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\ScriptText;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptTextRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
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
        $this->scriptUuid = $payload["scriptUuid"];
        $this->content = $payload["content"];
        $this->position = $payload["position"] ?? null;
    }

    protected function buildObject(): ScriptText
    {
        $text = new ScriptText();

        return $text->setContent($this->getContent());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
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
