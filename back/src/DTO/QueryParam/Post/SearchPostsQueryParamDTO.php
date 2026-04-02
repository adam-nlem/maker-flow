<?php

namespace App\DTO\QueryParam\Post;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Entity\Enum\Platform;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SearchPostsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    #[Assert\Uuid]
    private string $projectUuid;

    private ?Platform $platform;

    #[Assert\NotBlank]
    private string $search;

    private int $limit;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->projectUuid = $queryParams["projectUuid"] ?? "";
        $this->platform = !empty($queryParams["platform"]) ? Platform::tryFrom($queryParams["platform"]) : null;
        $this->search = $queryParams["search"] ?? "";
        $this->limit = (int) ($queryParams["limit"] ?? 20);
    }

    public function getProjectUuid(): string
    {
        return $this->projectUuid;
    }

    public function getPlatform(): ?Platform
    {
        return $this->platform;
    }

    public function getSearch(): string
    {
        return $this->search;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }
}
