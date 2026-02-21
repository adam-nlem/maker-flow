<?php

namespace App\DTO\Request\HookTemplate;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateHookTemplateRequestDTO extends AbstractRequestDTO
{
    private ?string $title;
    private ?string $content;
    private ?bool $isPublic;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
        $this->content = $payload["content"] ?? null;
        $this->isPublic = $payload["isPublic"] ?? null;
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
            'content' => $this->getContent(),
            'isPublic' => $this->getIsPublic(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function getIsPublic(): ?bool
    {
        return $this->isPublic;
    }
}
