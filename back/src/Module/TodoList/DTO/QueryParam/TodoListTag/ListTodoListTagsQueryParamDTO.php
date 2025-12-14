<?php

namespace App\Module\TodoList\DTO\QueryParam\TodoListTask;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Module\TodoList\Entity\Enum\TodoListStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListTodoListTagsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $todoListUuid;

    private ?string $searchTerm;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->todoListUuid = $queryParams["todoListUuid"];
        $this->searchTerm = $queryParams["searchTerm"] ?? null;
    }

    public function getTodoListUuid(): string
    {
        return $this->todoListUuid;
    }

    public function getSearchTerm(): ?string
    {
        return $this->searchTerm;
    }
}
