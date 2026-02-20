<?php

namespace App\DTO\QueryParam\ScriptTag;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptTagsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    private ?string $searchTerm;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"];
        $this->searchTerm = $queryParams["searchTerm"] ?? null;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getSearchTerm(): ?string
    {
        return $this->searchTerm;
    }
}
