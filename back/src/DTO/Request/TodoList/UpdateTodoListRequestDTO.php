<?php

namespace App\DTO\Request\TodoList;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Color;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class UpdateTodoListRequestDTO extends AbstractRequestDTO
{
    private string $title;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->title = $payload["title"];
    }

    public function buildObject(): array
    {
        return [
            'title' => $this->getTitle(),
        ];
    }

    public function getTitle(): string
    {
        return $this->title;
    }
}
