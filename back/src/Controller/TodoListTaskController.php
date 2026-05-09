<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\TodoListTask\ListTodoListTasksQueryParamDTO;
use App\DTO\Request\TodoListTask\CreateTodoListTaskRequestDTO;
use App\DTO\Request\TodoListTask\UpdateTodoListTaskRequestDTO;
use App\DTO\Response\TodoListTask\ListTodoListTasksGroupedByStatusResponseDTO;
use App\Entity\Enum\TodoListStatus;
use App\Entity\TodoListTask;
use App\Exception\TodoList\TodoListNotFoundException;
use App\Exception\TodoList\TodoListTaskNotFoundException;
use App\Repository\TodoListRepository;
use App\Repository\TodoListTagRepository;
use App\Repository\TodoListTaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/todo-lists/tasks', requirements: ['taskUuid' => Requirement::UUID])]
class TodoListTaskController extends AbstractController
{

    #[Route('', name: 'api_todo_lists_tasks_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListTodoListTasksQueryParamDTO $queryParamDto,
        TodoListTaskRepository $taskRepository,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($queryParamDto->getTodoListUuid(), $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        $statuses = $queryParamDto->getStatus() !== null
            ? [$queryParamDto->getStatus()]
            : TodoListStatus::cases();

        $result = array_map(
            fn(TodoListStatus $status) => (new ListTodoListTasksGroupedByStatusResponseDTO(
                $status,
                $taskRepository->getByTodoListAndStatusPaginated(
                    $todoList,
                    $status,
                    $queryParamDto->getPage(),
                    $queryParamDto->getLimit()
                )
            ))->getData(),
            $statuses
        );

        return $this->json(data: $result, status: Response::HTTP_OK, context: ['groups' => ['api_todo_lists_tasks_list']]);
    }

    #[Route('', name: 'api_todo_lists_tasks_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateTodoListTaskRequestDTO $dto,
        TodoListRepository $todoListRepository,
        TodoListTaskRepository $taskRepository,
        TodoListTagRepository $tagRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($dto->getTodoListUuid(), $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        /** @var TodoListTask $task */
        $task = $dto->build();

        $tagUuids = $dto->getTagUuids();

        $tags = $tagRepository->getByTodoListAndWithUuidIn($todoList, $tagUuids);

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
    #[IsGranted('ROLE_VIEWER')]
    public function show(string $taskUuid) {}

    #[Route('/{taskUuid}', name: 'api_todo_lists_tasks_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $taskUuid,
        UpdateTodoListTaskRequestDTO $dto,
        TodoListTaskRepository $taskRepository,
        TodoListTagRepository $tagRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $task = $taskRepository->getAccessibleByUuidForUser($taskUuid, $user);

        if ($task === null) {
            throw new TodoListTaskNotFoundException();
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
                $tags = $tagRepository->getByTodoListAndWithUuidIn($task->getTodoList(), $dto->getTagUuids());

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
    #[IsGranted('ROLE_EDITOR')]
    public function delete(string $taskUuid, TodoListTaskRepository $taskRepository)
    {
        /** @var User $user */
        $user = $this->getUser();

        $task = $taskRepository->getAccessibleByUuidForUser($taskUuid, $user);

        if ($task === null) {
            throw new TodoListTaskNotFoundException();
        }

        $taskRepository->remove($task, true);

        return $this->json(data: ['message' => 'Task deleted succesfully'], status: Response::HTTP_OK);
    }
}
