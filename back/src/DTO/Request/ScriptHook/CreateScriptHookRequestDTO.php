<?php

namespace App\DTO\Request\ScriptHook;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\ScriptHook;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateScriptHookRequestDTO extends AbstractRequestDTO
{
    private string $scriptUuid;
    private string $content;
    private ?string $generationUuid = null;
    private ?string $hookTemplateUuid = null;

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
        $this->generationUuid = $payload["generationUuid"] ?? null;
        $this->hookTemplateUuid = $payload["hookTemplateUuid"] ?? null;
    }

    protected function buildObject(): ScriptHook
    {
        $hook = new ScriptHook();

        return $hook->setContent($this->getContent());
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getGenerationUuid(): ?string
    {
        return $this->generationUuid;
    }

    public function getHookTemplateUuid(): ?string
    {
        return $this->hookTemplateUuid;
    }
}
