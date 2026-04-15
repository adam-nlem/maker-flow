<?php

namespace App\DTO\QueryParam\IntegrationInsight;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\TimePeriod;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListIntegrationInsightsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $projectUuid;

    private TimePeriod $timePeriod;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"] ?? "";
        $this->timePeriod = TimePeriod::tryFrom($queryParams["timePeriod"] ?? "")
            ?? TimePeriod::Last7Days;
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getTimePeriod(): TimePeriod
    {
        return $this->timePeriod;
    }
}
