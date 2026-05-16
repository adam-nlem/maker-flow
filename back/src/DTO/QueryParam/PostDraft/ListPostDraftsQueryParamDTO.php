<?php

namespace App\DTO\QueryParam\PostDraft;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\PostDraftStatus;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListPostDraftsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    private ?PostDraftStatus $status;

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
        $this->page = (int) $queryParams["page"];
        $this->limit = (int) $queryParams["limit"];
        $this->status = PostDraftStatus::tryFrom($queryParams["status"] ?? "");
        $searchTerm = trim((string) ($queryParams["searchTerm"] ?? ""));
        $this->searchTerm = $searchTerm === "" ? null : $searchTerm;
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

    public function getStatus(): ?PostDraftStatus
    {
        return $this->status;
    }

    public function getSearchTerm(): ?string
    {
        return $this->searchTerm;
    }
}
