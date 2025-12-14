<?php

namespace App\Module\TodoList\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\Module\TodoList\DTO\QueryParam\TodoListTask\ListTodoListTasksQueryParamDTO;
use App\Module\TodoList\DTO\Request\TodoListTask\CreateTodoListTaskRequestDTO;
use App\Module\TodoList\Entity\TodoListTask;
use App\Module\TodoList\Repository\TodoListRepository;
use App\Module\TodoList\Repository\TodoListTagRepository;
use App\Module\TodoList\Repository\TodoListTaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists/tasks')]
class TodoListTaskController extends AbstractController
{

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(
        ListTodoListTasksQueryParamDTO $queryParamDto,
        TodoListTaskRepository $taskRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        return $this->json($queryParamDto);
        if ($queryParamDto->getTodoListStatus() === null) {
            //TODO: get All the todo list tasks paginated for a todo list
        } else {
            //TODO: get the amount of tasks for the status
        }
    }

    #[Route('', name: 'api_modules_todo_lists_tasks_create', methods: ['POST'])]
    public function create(
        CreateTodoListTaskRequestDTO $dto,
        TodoListRepository $todoListRepository,
        TodoListTaskRepository $taskRepository,
        TodoListTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($dto->getTodoListUuid(), $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var TodoListTask $task */
            $task = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $tagUuids = $dto->getTagUuids();

        $tags = $tagRepository->getByUserAndWithUuidIn($user, $tagUuids);

        $task
            ->setUser($user)
            ->setTodoList($todoList);

        foreach ($tags as $tag) {
            $task->addTag($tag);
        }

        $taskRepository->save($task, true);

        return $this->json(
            data: $task,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_tasks_create']]
        );
    }

    #[Route('/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid) {}

    #[Route('/{uuid}', name: 'update', methods: ['PUT'])]
    public function update(string $uuid) {}

    #[Route('/{uuid}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $uuid) {}
}
