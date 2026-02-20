<?php

namespace App\DTO\QueryParam\Integration;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListIntegrationsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $projectUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"];
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }
}
