<?php

namespace App\DTO\QueryParam\Script;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListCalendarScriptsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $year;

    #[Assert\NotBlank]
    #[Assert\Range(min: 1, max: 12)]
    private int $month;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"];
        $this->year = (int) $queryParams["year"];
        $this->month = (int) $queryParams["month"];
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getYear(): int
    {
        return $this->year;
    }

    public function getMonth(): int
    {
        return $this->month;
    }
}
