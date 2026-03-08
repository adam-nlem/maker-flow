<?php

namespace App\DTO\QueryParam\Script;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\ScriptStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListScriptsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    private ?ScriptStatus $status;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"];
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
        $this->status = ScriptStatus::tryFrom($queryParams["status"] ?? "");
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }

    public function getStatus(): ?ScriptStatus
    {
        return $this->status;
    }
}
