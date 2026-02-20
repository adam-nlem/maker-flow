<?php

namespace App\DTO\Request\TodoList;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\TodoList;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateTodoListRequestDTO extends AbstractRequestDTO
{
    private string $projectUuid;
    private string $title;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->projectUuid = $payload["projectUuid"];
        $this->title = $payload["title"];
    }

    protected function buildObject(): TodoList
    {
        $todoList = new TodoList();

        return $todoList
            ->setTitle($this->getTitle());
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }
}
