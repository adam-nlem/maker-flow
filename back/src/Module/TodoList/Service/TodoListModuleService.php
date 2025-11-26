<?php

namespace App\Module\TodoList\Service;

use App\Entity\User;

class TodoListModuleService
{
    public function getWidgetData(?User $user = null): array
    {
        // TODO: implement real logic
        return [
            'module' => 'TodoList',
            'userId' => $user?->getId(),
        ];
    }
}
