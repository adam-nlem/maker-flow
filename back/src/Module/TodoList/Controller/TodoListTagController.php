<?php

namespace App\Module\TodoList\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\Module\TodoList\DTO\Request\TodoListTag\CreateTodoListTagRequestDTO;
use App\Module\TodoList\DTO\Request\TodoListTag\UpdateTodoListTagRequestDTO;
use App\Module\TodoList\Entity\TodoListTag;
use App\Module\TodoList\Entity\TodoListTask;
use App\Module\TodoList\Repository\TodoListRepository;
use App\Module\TodoList\Repository\TodoListTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists/tags')]
class TodoListTagController extends AbstractController
{
    #[Route('', name: 'api_modules_todo_lists_tags_list', methods: ['GET'])]
    public function list(
        TodoListTagRepository $tagRepository,
        TodoListRepository $todoListRepository,
        Request $request,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoListUuid = $request->query->get('todoListUuid');
        $searchTerm = $request->query->get('searchTerm');

        if ($todoListUuid === null) {
            return $this->json(data: ["message" => "todoListUuid query parameter is required"], status: Response::HTTP_BAD_REQUEST);
        }

        $todoList = $todoListRepository->getByUuidAndUser($todoListUuid, $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($searchTerm !== null) {
            $tags = $tagRepository->getBySearchTermAndUserAndTodoListLimited($searchTerm, $user, $todoList, 20);
            // List Tags by serach term and limit to 20
        } else {
            $tags = $tagRepository->getByUserAndTodoListLimited($user, $todoList, 20);
        }

        return $this->json(
            data: $tags,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_tags_list']]
        );
    }

    #[Route('', name: 'api_modules_todo_lists_tags_create', methods: ['POST'])]
    public function create(
        CreateTodoListTagRequestDTO $dto,
        TodoListRepository $todoListRepository,
        TodoListTagRepository $tagRepository
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($dto->getTodoListUuid(), $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var TodoListTag $tag */
            $tag = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }

        $tag
            ->setUser($user)
            ->setTodoList($todoList);

        $tagRepository->save($tag, true);

        return $this->json(
            data: $tag,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_tags_create']]
        );
    }

    #[Route('/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid) {}

    #[Route('/{tagUuid}', name: 'api_modules_todo_lists_tags_update', methods: ['PATCH'])]
    public function update(
        string $tagUuid,
        UpdateTodoListTagRequestDTO $dto,
        TodoListTagRepository $tagRepository,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getByUuidAndUser($tagUuid, $user);

        if ($tag === null) {
            return $this->json(data: ["message" => "You don't have any tag with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($dto->getTitle() !== null && $dto->getTitle() != $tag->getTitle()) {
            // We check if there is another tag with the same title in the same todo list (we don't want that to happen)
            $tagWithSameTitle = $tagRepository->getByTitleAndTodoListAndUser($dto->getTitle(), $tag->getTodoList(), $user);
            if ($tagWithSameTitle !== null) {
                return $this->json(data: ["Message" => "You already use this title for another tag in this todo list"], status: Response::HTTP_CONFLICT);
            }
            $tag->setTitle($dto->getTitle());
        }

        if ($dto->getColor() !== null && $dto->getColor() !== $tag->getColor()) {
            $tag->setColor($dto->getColor());
        }

        $tagRepository->save($tag, true);

        return $this->json(data: $tag, status: Response::HTTP_OK, context: ['groups' => ['api_modules_todo_lists_tags_update']]);
    }

    #[Route('/{tagUuid}', name: 'api_modules_todo_lists_tags_delete', methods: ['DELETE'])]
    public function delete(string $tagUuid, TodoListTagRepository $tagRepository)
    {
        /** @var User $user */
        $user = $this->getUser();

        $tag = $tagRepository->getByUuidAndUser($tagUuid, $user);

        if ($tag === null) {
            return $this->json(data: ["message" => "You don't have any tag with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        $tagRepository->remove($tag, true);

        return $this->json(data: ['message' => 'Tag deleted succesfully'], status: Response::HTTP_OK);
    }
}
