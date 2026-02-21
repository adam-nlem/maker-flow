<?php

namespace App\DTO\QueryParam\HookTemplate;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListHookTemplatesQueryParamDTO extends AbstractQueryParamDTO
{
    private ?string $searchTerm;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->searchTerm = $queryParams["searchTerm"] ?? null;
    }

    public function getSearchTerm(): ?string
    {
        return $this->searchTerm;
    }
}
