<?php

namespace App\Module\TodoList\Controller;

use App\Module\TodoList\Service\TodoListModuleService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/modules/todo-list', name: 'module_todo_list_')]
class TodoListModuleController extends AbstractController
{
    public function __construct(
        private readonly TodoListModuleService $service,
    ) {
    }

    #[Route('/', name: 'index', methods: ['GET'])]
    public function index(Request $request): JsonResponse
    {
        // TODO: call service etc.
        return $this->json();
    }
}
