<?php

namespace App\DTO\QueryParam\Review;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListReviewCommentsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $reviewVersionUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

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
        $this->reviewVersionUuid = $queryParams["reviewVersionUuid"] ?? "";
        $this->page = (int) ($queryParams["page"] ?? 1);
        $this->limit = (int) ($queryParams["limit"] ?? 20);
    }

    public function getReviewVersionUuid(): string
    {
        return $this->reviewVersionUuid;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
