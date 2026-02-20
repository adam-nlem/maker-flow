<?php

namespace App\DTO\Request\TodoListTag;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\Color;
use App\Entity\TodoListTag;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateTodoListTagRequestDTO extends AbstractRequestDTO
{
    private string $todoListUuid;
    private string $title;
    private Color $color;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->todoListUuid = $payload["todoListUuid"];
        $this->title = $payload["title"];
        $this->color = Color::tryFrom($payload["color"] ?? "") ?? Color::Green;
    }

    protected function buildObject(): TodoListTag
    {
        $tag = new TodoListTag();

        return $tag
            ->setTitle($this->getTitle())
            ->setColor($this->getColor());
    }

    public function getTodoListUuid(): string
    {
        return $this->todoListUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function getColor(): Color
    {
        return $this->color;
    }
}
