<?php

namespace App\DTO\Response\TodoListTask;

use App\DTO\Response\ResponseDTOInterface;
use App\Entity\Enum\TodoListStatus;
use Symfony\Component\Serializer\Attribute\Groups;

class ListTodoListTasksGroupedByStatusResponseDTO implements ResponseDTOInterface
{

    public function __construct(
        #[Groups([
            'api_todo_lists_tasks_list'
        ])]
        private TodoListStatus $status,
        /** @var TodoListTask[] $todoListTasks */
        #[Groups([
            'api_todo_lists_tasks_list'
        ])]
        private array $todoListTasks,
    ) {}

    public function getData(): array
    {
        return [
            'status' => $this->getStatus()->value,
            'todoListTasks' => $this->getTodoListTasks(),
        ];
    }

    public function getStatus(): TodoListStatus
    {
        return $this->status;
    }

    public function getTodoListTasks(): array
    {
        return $this->todoListTasks;
    }
}
