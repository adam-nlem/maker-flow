<?php

namespace App\DTO\QueryParam\ScriptGeneration;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptGenerationQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $scriptUuid;

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
        $this->scriptUuid = $queryParams["scriptUuid"] ?? "";
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
    }

    public function getScriptUuid(): string
    {
        return $this->scriptUuid;
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
