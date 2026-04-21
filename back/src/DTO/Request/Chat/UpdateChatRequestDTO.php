<?php

namespace App\DTO\Request\Chat;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateChatRequestDTO extends AbstractRequestDTO
{
    private ?string $title;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->title = $payload["title"] ?? null;
    }

    protected function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
        ];
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }
}
