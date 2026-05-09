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
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/todo-lists', requirements: ['todoListUuid' => Requirement::UUID])]
class TodoListController extends AbstractController
{

    #[Route('', name: 'api_todo_lists_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListTodoListsQueryParamDTO $queryParamDto,
        TodoListRepository $todoListRepository,
        ProjectRepository $projectRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($queryParamDto->getProjectUuid(), $user);

        if ($project === null) {
            throw new ProjectNotFoundException();
        }

        $todoLists = $todoListRepository->getByProject($project);

        return $this->json(
            data: $todoLists,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_list']]
        );
    }

    #[Route('', name: 'api_todo_lists_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateTodoListRequestDTO $dto,
        ProjectRepository $projectRepository,
        TodoListRepository $todoListRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $project = $projectRepository->getAccessibleByUuidForUser($dto->getProjectUuid(), $user);

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
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $todoListUuid,
        UpdateTodoListRequestDTO $dto,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($todoListUuid, $user);

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
    #[IsGranted('ROLE_EDITOR')]
    public function delete(
        string $todoListUuid,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($todoListUuid, $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        $todoListRepository->remove($todoList, true);

        return $this->json(data: ["message" => "Todo list deleted successfully"], status: Response::HTTP_OK);
    }
}
