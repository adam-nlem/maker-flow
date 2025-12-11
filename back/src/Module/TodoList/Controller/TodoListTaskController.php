<?php

namespace App\Module\TodoList\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\Module\TodoList\DTO\Request\TodoListTask\CreateTodoListTaskRequestDTO;
use App\Module\TodoList\Entity\TodoListTask;
use App\Module\TodoList\Repository\TodoListTagRepository;
use App\Module\TodoList\Repository\TodoListTaskRepository;
use App\Module\TodoList\Service\TodoListModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists/tasks')]
class TodoListTaskController extends AbstractController
{

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(TodoListTaskRepository $taskRepository)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_todo_lists_tasks_create', methods: ['POST'])]
    public function create(CreateTodoListTaskRequestDTO $dto, TodoListTaskRepository $taskRepository, TodoListTagRepository $tagRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            /** @var TodoListTask $task */
            $task = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $tagUuids = $dto->getTagUuids();

        $tags = $tagRepository->getByUserAndWithUuidIn($user, $tagUuids);

        $task->setUser($user);

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
