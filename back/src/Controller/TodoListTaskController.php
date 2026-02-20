<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\DTO\QueryParam\TodoListTask\ListTodoListTasksQueryParamDTO;
use App\DTO\Request\TodoListTask\CreateTodoListTaskRequestDTO;
use App\DTO\Request\TodoListTask\UpdateTodoListTaskRequestDTO;
use App\DTO\Response\TodoListTask\ListTodoListTasksGroupedByStatusResponseDTO;
use App\Entity\Enum\TodoListStatus;
use App\Entity\TodoListTask;
use App\Repository\TodoListRepository;
use App\Repository\TodoListTagRepository;
use App\Repository\TodoListTaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/todo-lists/tasks')]
class TodoListTaskController extends AbstractController
{

    #[Route('', name: 'api_todo_lists_tasks_list', methods: ['GET'])]
    public function list(
        ListTodoListTasksQueryParamDTO $queryParamDto,
        TodoListTaskRepository $taskRepository,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($queryParamDto->getTodoListUuid(), $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $statuses = $queryParamDto->getStatus() !== null
            ? [$queryParamDto->getStatus()]
            : TodoListStatus::cases();

        $result = array_map(
            fn(TodoListStatus $status) => (new ListTodoListTasksGroupedByStatusResponseDTO(
                $status,
                $taskRepository->getByTodoListAndStatusAndUserPaginated(
                    $todoList,
                    $status,
                    $user,
                    $queryParamDto->getPage(),
                    $queryParamDto->getLimit()
                )
            ))->getData(),
            $statuses
        );

        return $this->json(data: $result, status: Response::HTTP_OK, context: ['groups' => ['api_todo_lists_tasks_list']]);
    }

    #[Route('', name: 'api_todo_lists_tasks_create', methods: ['POST'])]
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
            context: ['groups' => ['api_todo_lists_tasks_create']]
        );
    }

    #[Route('/{taskUuid}', name: 'api_todo_lists_tasks_show', methods: ['GET'])]
    public function show(string $taskUuid) {}

    #[Route('/{taskUuid}', name: 'api_todo_lists_tasks_update', methods: ['PATCH'])]
    public function update(
        string $taskUuid,
        UpdateTodoListTaskRequestDTO $dto,
        TodoListTaskRepository $taskRepository,
        TodoListTagRepository $tagRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $task = $taskRepository->getByUuidAndUser($taskUuid, $user);

        if ($task === null) {
            return $this->json(data: ["message" => "You don't have any task with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() !== $task->getTitle()) {
            $task->setTitle($dto->getTitle());
        }

        if ($dto->getContent() !== null && $dto->getContent() !== $task->getContent()) {
            $task->setContent($dto->getContent());
        }

        if ($dto->getStatus() !== null && $dto->getStatus() !== $task->getStatus()) {
            $task->setStatus($dto->getStatus());
        }

        if ($dto->getPriority() !== null && $dto->getPriority() !== $task->getPriority()) {
            $task->setPriority($dto->getPriority());
        }

        if ($dto->getDueDate() !== null && $dto->getDueDate() != $task->getDueDate()) {
            $task->setDueDate($dto->getDueDate());
        }

        if ($dto->getTagUuids() !== null) {
            $currentTagUuids = $task->getTags()->map(fn($tag) => $tag->getUuid())->toArray();
            sort($currentTagUuids);
            $newTagUuids = $dto->getTagUuids();
            sort($newTagUuids);

            if ($currentTagUuids !== $newTagUuids) {
                $tags = $tagRepository->getByUserAndWithUuidIn($user, $dto->getTagUuids());

                $task->getTags()->clear();
                foreach ($tags as $tag) {
                    $task->addTag($tag);
                }
            }
        }

        $taskRepository->save($task, true);

        return $this->json(
            data: $task,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_tasks_update']]
        );
    }

    #[Route('/{taskUuid}', name: 'api_todo_lists_tasks_delete', methods: ['DELETE'])]
    public function delete(string $taskUuid, TodoListTaskRepository $taskRepository)
    {
        /** @var User $user */
        $user = $this->getUser();

        $task = $taskRepository->getByUuidAndUser($taskUuid, $user);

        if ($task === null) {
            return $this->json(data: ["message" => "You don't have any task with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $taskRepository->remove($task, true);

        return $this->json(data: ['message' => 'Task deleted succesfully'], status: Response::HTTP_OK);
    }
}
