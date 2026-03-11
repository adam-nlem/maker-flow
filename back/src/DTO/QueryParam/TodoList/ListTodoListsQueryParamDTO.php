<?php

namespace App\DTO\QueryParam\TodoList;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\TodoListStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListTodoListsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"] ?? "";
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }
}
