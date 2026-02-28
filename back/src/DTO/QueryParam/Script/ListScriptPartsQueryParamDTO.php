<?php

namespace App\DTO\QueryParam\Script;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptPartsQueryParamDTO extends AbstractQueryParamDTO
{
    private ?string $generationUuid = null;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->generationUuid = $queryParams["generationUuid"] ?? null;
    }

    public function getGenerationUuid(): ?string
    {
        return $this->generationUuid;
    }
}
