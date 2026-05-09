<?php

namespace App\Controller;

use App\Entity\User;
use App\DTO\QueryParam\TodoListTag\ListTodoListTagsQueryParamDTO;
use App\DTO\Request\TodoListTag\CreateTodoListTagRequestDTO;
use App\DTO\Request\TodoListTag\UpdateTodoListTagRequestDTO;
use App\Entity\TodoListTag;
use App\Exception\TodoList\TodoListNotFoundException;
use App\Exception\TodoList\TodoListTagNotFoundException;
use App\Exception\TodoList\TodoListTagTitleConflictException;
use App\Repository\TodoListRepository;
use App\Repository\TodoListTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/todo-lists/tags', requirements: ['tagUuid' => Requirement::UUID])]
class TodoListTagController extends AbstractController
{
    #[Route('', name: 'api_todo_lists_tags_list', methods: ['GET'])]
    #[IsGranted('ROLE_VIEWER')]
    public function list(
        ListTodoListTagsQueryParamDTO $queryParamDto,
        TodoListTagRepository $tagRepository,
        TodoListRepository $todoListRepository,
        Request $request,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($queryParamDto->getTodoListUuid(), $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        if ($queryParamDto->getSearchTerm() !== null) {
            $tags = $tagRepository->getBySearchTermAndTodoListLimited($queryParamDto->getSearchTerm(), $todoList, 20);
        } else {
            $tags = $tagRepository->getByTodoListLimited($todoList, 20);
        }

        return $this->json(
            data: $tags,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_tags_list']]
        );
    }

    #[Route('', name: 'api_todo_lists_tags_create', methods: ['POST'])]
    #[IsGranted('ROLE_EDITOR')]
    public function create(
        CreateTodoListTagRequestDTO $dto,
        TodoListRepository $todoListRepository,
        TodoListTagRepository $tagRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getAccessibleByUuidForUser($dto->getTodoListUuid(), $user);

        if ($todoList === null) {
            throw new TodoListNotFoundException();
        }

        /** @var TodoListTag $tag */
        $tag = $dto->build();

        $tag
            ->setUser($user)
            ->setTodoList($todoList);

        $tagRepository->save($tag, true);

        return $this->json(
            data: $tag,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_tags_create']]
        );
    }

    #[Route('/{tagUuid}', name: 'api_todo_lists_tags_update', methods: ['PATCH'])]
    #[IsGranted('ROLE_EDITOR')]
    public function update(
        string $tagUuid,
        UpdateTodoListTagRequestDTO $dto,
        TodoListTagRepository $tagRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getAccessibleByUuidForUser($tagUuid, $user);

        if ($tag === null) {
            throw new TodoListTagNotFoundException();
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $tag->getTitle()) {
            // We check if there is another tag with the same title in the same todo list (we don't want that to happen)
            $tagWithSameTitle = $tagRepository->getByTitleAndTodoList($dto->getTitle(), $tag->getTodoList());
            if ($tagWithSameTitle !== null) {
                throw new TodoListTagTitleConflictException();
            }
            $tag->setTitle($dto->getTitle());
        }

        if ($dto->getColor() !== null && $dto->getColor() !== $tag->getColor()) {
            $tag->setColor($dto->getColor());
        }

        $tagRepository->save($tag, true);

        return $this->json(data: $tag, status: Response::HTTP_OK, context: ['groups' => ['api_todo_lists_tags_update']]);
    }

    #[Route('/{tagUuid}', name: 'api_todo_lists_tags_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_EDITOR')]
    public function delete(string $tagUuid, TodoListTagRepository $tagRepository)
    {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getAccessibleByUuidForUser($tagUuid, $user);

        if ($tag === null) {
            throw new TodoListTagNotFoundException();
        }

        $tagRepository->remove($tag, true);

        return $this->json(data: ['message' => 'Tag deleted succesfully'], status: Response::HTTP_OK);
    }
}
