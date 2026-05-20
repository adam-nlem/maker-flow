<?php

namespace App\DTO\QueryParam\Review;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class StreamHlsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $reviewVersionUuid;

    #[Assert\NotBlank]
    private string $path;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->reviewVersionUuid = (string) ($queryParams["reviewVersionUuid"] ?? "");
        $this->path = trim((string) ($queryParams["path"] ?? ""));
    }

    public function getReviewVersionUuid(): string
    {
        return $this->reviewVersionUuid;
    }

    public function getPath(): string
    {
        return $this->path;
    }
}
