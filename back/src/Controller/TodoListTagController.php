<?php

namespace App\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\DTO\QueryParam\TodoListTag\ListTodoListTagsQueryParamDTO;
use App\DTO\Request\TodoListTag\CreateTodoListTagRequestDTO;
use App\DTO\Request\TodoListTag\UpdateTodoListTagRequestDTO;
use App\Entity\TodoListTag;
use App\Entity\TodoListTask;
use App\Repository\TodoListRepository;
use App\Repository\TodoListTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Requirement\Requirement;

#[Route('/api/todo-lists/tags', requirements: ['tagUuid' => Requirement::UUID])]
class TodoListTagController extends AbstractController
{
    #[Route('', name: 'api_todo_lists_tags_list', methods: ['GET'])]
    public function list(
        ListTodoListTagsQueryParamDTO $queryParamDto,
        TodoListTagRepository $tagRepository,
        TodoListRepository $todoListRepository,
        Request $request,
    ) {
        /** @var User $user */
        $user = $this->getUser();

        $todoList = $todoListRepository->getByUuidAndUser($queryParamDto->getTodoListUuid(), $user);

        if ($todoList === null) {
            return $this->json(data: ["message" => "You don't have any todo list with this uuid"], status: Response::HTTP_NOT_FOUND);
        }

        if ($queryParamDto->getSearchTerm() !== null) {
            $tags = $tagRepository->getBySearchTermAndUserAndTodoListLimited($queryParamDto->getSearchTerm(), $user, $todoList, 20);
            // List Tags by serach term and limit to 20
        } else {
            $tags = $tagRepository->getByUserAndTodoListLimited($user, $todoList, 20);
        }

        return $this->json(
            data: $tags,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_todo_lists_tags_list']]
        );
    }

    #[Route('', name: 'api_todo_lists_tags_create', methods: ['POST'])]
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
            context: ['groups' => ['api_todo_lists_tags_create']]
        );
    }

    #[Route('/{tagUuid}', name: 'api_todo_lists_tags_show', methods: ['GET'])]
    public function show(string $tagUuid) {}

    #[Route('/{tagUuid}', name: 'api_todo_lists_tags_update', methods: ['PATCH'])]
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

        return $this->json(data: $tag, status: Response::HTTP_OK, context: ['groups' => ['api_todo_lists_tags_update']]);
    }

    #[Route('/{tagUuid}', name: 'api_todo_lists_tags_delete', methods: ['DELETE'])]
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
