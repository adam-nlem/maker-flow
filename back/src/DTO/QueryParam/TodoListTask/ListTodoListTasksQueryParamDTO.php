<?php

namespace App\DTO\QueryParam\TodoListTask;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\TodoListStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListTodoListTasksQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $todoListUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    private ?TodoListStatus $status;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->todoListUuid = $queryParams["todoListUuid"];
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
        $this->status = TodoListStatus::tryFrom($queryParams["status"] ?? "");
    }

    public function getTodoListUuid(): string
    {
        return $this->todoListUuid;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }

    public function getStatus(): ?TodoListStatus
    {
        return $this->status;
    }
}
