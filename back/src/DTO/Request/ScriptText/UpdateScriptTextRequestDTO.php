<?php

namespace App\DTO\Request\ScriptText;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateScriptTextRequestDTO extends AbstractRequestDTO
{
    private ?string $content;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->content = $payload["content"] ?? null;
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
}
