<?php

namespace App\DTO\QueryParam\PostGroup;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class RankPostGroupsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $projectUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"] ?? "";
        $this->limit = (int) ($queryParams["limit"] ?? 10);
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
