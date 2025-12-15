<?php

namespace App\Module\TodoList\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\Module\TodoList\DTO\QueryParam\TodoList\ListTodoListsQueryParamDTO;
use App\Module\TodoList\DTO\Request\TodoList\CreateTodoListRequestDTO;
use App\Module\TodoList\DTO\Request\TodoList\UpdateTodoListRequestDTO;
use App\Module\TodoList\Entity\TodoList;
use App\Module\TodoList\Repository\TodoListRepository;
use App\Repository\UserModuleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists')]
class TodoListController extends AbstractController
{

    #[Route('', name: 'api_modules_todo_lists_list', methods: ['GET'])]
    public function list(
        ListTodoListsQueryParamDTO $queryParamDto,
        TodoListRepository $todoListRepository,
        UserModuleRepository $userModuleRepository,
        Request $request,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $userModule = $userModuleRepository->getByUuidAndUser($queryParamDto->getUserModuleUuid(), $user);

        if ($userModule === null) {
            return $this->json(data: ["message" => "You don't have any user module with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $todoLists = $todoListRepository->getByUserModuleAndUser($userModule, $user);

        return $this->json(
            data: $todoLists,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_list']]
        );
    }

    #[Route('', name: 'api_modules_todo_lists_create', methods: ['POST'])]
    public function create(
        CreateTodoListRequestDTO $dto,
        UserModuleRepository $userModuleRepository,
        TodoListRepository $todoListRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $userModule = $userModuleRepository->getByUuidAndUser($dto->getUserModuleUuid(), $user);

        if ($userModule === null) {
            return $this->json(data: ["message" => "You don't have any user module with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var TodoList $todoList */
            $todoList = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $todoList
            ->setUser($user)
            ->setUserModule($userModule);

        $todoListRepository->save($todoList, true);

        return $this->json(
            data: $todoList,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_create']]
        );
    }

    // #[Route('/{uuid}', name: 'api_modules_todo_lists_show', methods: ['GET'])]
    // public function show(string $uuid) {}

    #[Route('/{todoListUuid}', name: 'api_modules_todo_lists_update', methods: ['PATCH'])]
    public function update(
        string $todoListUuid,
        UpdateTodoListRequestDTO $dto,
        TodoListRepository $todoListRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($todoListUuid, $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $todoList->getTitle()) {
            $todoList->setTitle($dto->getTitle());
        }

        $todoListRepository->save($todoList, true);

        return $this->json(
            data: $todoList,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_update']]
        );
    }

    // #[Route('/{uuid}', name: 'api_modules_todo_lists_delete', methods: ['DELETE'])]
    // public function delete(string $uuid) {}
}
