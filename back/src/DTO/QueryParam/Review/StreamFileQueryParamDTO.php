<?php

namespace App\DTO\QueryParam\Review;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StreamFileQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $reviewVersionUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $index;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->reviewVersionUuid = (string) ($queryParams["reviewVersionUuid"] ?? "");
        $this->index = (int) ($queryParams["index"] ?? 0);
    }

    public function getReviewVersionUuid(): string
    {
        return $this->reviewVersionUuid;
    }

    public function getIndex(): int
    {
        return $this->index;
    }
}
