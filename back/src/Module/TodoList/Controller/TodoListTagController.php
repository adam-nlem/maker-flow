<?php

namespace App\Module\TodoList\Controller;

use App\DTO\Request\Exception\CustomValidationException;
use App\Entity\User;
use App\Module\TodoList\DTO\Request\TodoListTag\CreateTodoListTagRequestDTO;
use App\Module\TodoList\Entity\TodoListTag;
use App\Module\TodoList\Entity\TodoListTask;
use App\Module\TodoList\Repository\TodoListTagRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-lists/tags')]
class TodoListTagController extends AbstractController
{

    #[Route('', name: 'list', methods: ['GET'])]
    public function list(TodoListTagRepository $tagRepository)
    {
        /** @var User $user */
        $user = $this->getUser();
    }

    #[Route('', name: 'api_modules_todo_lists_tags_create', methods: ['POST'])]
    public function create(CreateTodoListTagRequestDTO $dto, TodoListTagRepository $tagRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        try {
            /** @var TodoListTag $tag */
            $tag = $dto->build();
        } catch (CustomValidationException $e) {
            return $this->json(data: $e->getData(), status: Response::HTTP_CONFLICT);
        }



        $tagRepository->save($tag, true);

        return $this->json(
            data: $tag,
            status: Response::HTTP_OK,
            context: ['groups' => ['api_modules_todo_lists_tags_create']]
        );
    }

    #[Route('/{uuid}', name: 'show', methods: ['GET'])]
    public function show(string $uuid) {}

    #[Route('/{uuid}', name: 'update', methods: ['PUT'])]
    public function update(string $uuid) {}

    #[Route('/{uuid}', name: 'delete', methods: ['DELETE'])]
    public function delete(string $uuid) {}
}
