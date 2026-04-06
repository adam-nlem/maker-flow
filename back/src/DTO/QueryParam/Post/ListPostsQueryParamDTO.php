<?php

namespace App\DTO\QueryParam\Post;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\Platform;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListPostsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $projectUuid;

    private ?Platform $platform;

    private ?string $searchTerm;

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
        $this->projectUuid = $queryParams["projectUuid"];
        $this->platform = !empty($queryParams["platform"]) ? Platform::tryFrom($queryParams["platform"]) : null;
        $this->searchTerm = $queryParams["searchTerm"] ?? null;
        $this->page = (int) $queryParams["page"];
        $this->limit = (int) $queryParams["limit"];
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getPlatform(): ?Platform
    {
        return $this->platform;
    }

    public function getSearchTerm(): ?string
    {
        return $this->searchTerm;
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
