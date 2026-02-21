<?php

namespace App\DTO\Request\HookTemplate;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\HookTemplate;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateHookTemplateRequestDTO extends AbstractRequestDTO
{
    private string $title;
    private string $content;
    private bool $isPublic;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"];
        $this->content = $payload["content"];
        $this->isPublic = $payload["isPublic"] ?? false;
    }

    protected function buildObject(): HookTemplate
    {
        $hookTemplate = new HookTemplate();
        $hookTemplate
            ->setTitle($this->getTitle())
            ->setContent($this->getContent())
            ->setIsPublic($this->getIsPublic());

        return $hookTemplate;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function getIsPublic(): bool
    {
        return $this->isPublic;
    }
}
