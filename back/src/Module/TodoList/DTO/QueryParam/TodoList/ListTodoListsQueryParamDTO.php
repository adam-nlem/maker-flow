<?php

namespace App\Module\TodoList\DTO\QueryParam\TodoListTask;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Module\TodoList\Entity\Enum\TodoListStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListTodoListsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $userModuleUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->userModuleUuid = $queryParams["userModuleUuid"];
    }

    public function getUserModuleUuid(): string
    {
        return $this->userModuleUuid;
    }
}
