<?php

namespace App\Entity\Enum;

enum ModuleIdentifier: string
{
    case GithubStats = 'github_stats';
    case TodoList = 'todo_list';
}
