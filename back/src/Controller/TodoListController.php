<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\TodoList\ListTodoListsQueryParamDTO;
use App\DTO\Request\TodoList\CreateTodoListRequestDTO;
use App\DTO\Request\TodoList\UpdateTodoListRequestDTO;
use App\Entity\TodoList;
use App\Exception\Project\ProjectNotFoundException;
use App\Exception\TodoList\TodoListNotFoundException;
use App\Repository\ProjectRepository;
use App\Repository\TodoListRepository;
use App\Repository\TodoListTagRepository;
use App\Repository\TodoListTaskRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/todo-lists', requirements: ['todoListUuid' => Requirement::UUID])]
class TodoListController extends AbstractController
{

    #[Route('', name: 'api_todo_lists_list', methods: ['GET'])]
    public function list(
        ListTodoListsQueryParamDTO $queryParamDto,
        TodoListRepository $todoListRepository,
        ProjectRepository $projectRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $todoLists = $todoListRepository->getByProjectAndUser($project, $user);

        return $this->json(
            data: $todoLists,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_list']]
        );
    }

    #[Route('', name: 'api_todo_lists_create', methods: ['POST'])]
    public function create(
        CreateTodoListRequestDTO $dto,
        ProjectRepository $projectRepository,
        TodoListRepository $todoListRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getByUuidAndUser($dto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        /** @var TodoList $todoList */
        $todoList = $dto->build();

        $todoList
            ->setUser($user)
            ->setProject($project);

        $todoListRepository->save($todoList, true);

        return $this->json(
            data: $todoList,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_create']]
        );
    }

    #[Route('/{todoListUuid}', name: 'api_todo_lists_update', methods: ['PATCH'])]
    public function update(
        string $todoListUuid,
        UpdateTodoListRequestDTO $dto,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($todoListUuid, $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $todoList->getTitle()) {
            $todoList->setTitle($dto->getTitle());
        }

        $todoListRepository->save($todoList, true);

        return $this->json(
            data: $todoList,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_update']]
        );
    }

    #[Route('/{todoListUuid}', name: 'api_todo_lists_delete', methods: ['DELETE'])]
    public function delete(
        string $todoListUuid,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($todoListUuid, $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        $todoListRepository->remove($todoList, true);

        return $this->json(data: ["message" => "Todo list deleted successfully"], status: Response::HTTP_OK);
    }
}
