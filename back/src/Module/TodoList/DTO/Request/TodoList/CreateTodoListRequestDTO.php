<?php

namespace App\Module\TodoList\DTO\Request\TodoList;

use App\DTO\Request\AbstractRequestDTO;
use App\Module\TodoList\Entity\TodoList;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateTodoListRequestDTO extends AbstractRequestDTO
{
    private string $userModuleUuid;
    private string $title;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->userModuleUuid = $payload["userModuleUuid"];
        $this->title = $payload["title"];
    }

    protected function buildObject(): TodoList
    {
        $todoList = new TodoList();

        return $todoList
            ->setTitle($this->getTitle());
    }

    public function getUserModuleUuid(): string
    {
        return $this->userModuleUuid;
    }

    public function getTitle(): string
    {
        return $this->title;
    }
}
