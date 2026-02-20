<?php

namespace App\DTO\QueryParam\PostInsight;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\TimePeriod;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListPostInsightQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $integrationUuid;

    #[Assert\NotBlank]
    private TimePeriod $timePeriod;


    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->integrationUuid = $queryParams["integrationUuid"] ?? "";
        $this->timePeriod = TimePeriod::tryFrom($queryParams["timePeriod"] ?? "")
            ?? TimePeriod::Last7Days;
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }

    public function getTimePeriod(): TimePeriod
    {
        return $this->timePeriod;
    }
}
