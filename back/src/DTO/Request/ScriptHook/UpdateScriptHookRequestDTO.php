<?php

namespace App\DTO\Request\ScriptHook;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptHookRequestDTO extends AbstractRequestDTO
{
    private ?string $content;
    private ?string $hookTemplateUuid;
    private bool $hasHookTemplateUuid = false;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
        $this->hookTemplateUuid = $payload["hookTemplateUuid"] ?? null;
        $this->hasHookTemplateUuid = array_key_exists("hookTemplateUuid", $payload);
    }

    protected function buildObject(): array
    {
        return [
            'content' => $this->getContent(),
        ];
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getHookTemplateUuid(): ?string
    {
        return $this->hookTemplateUuid;
    }

    public function hasHookTemplateUuid(): bool
    {
        return $this->hasHookTemplateUuid;
    }
}
