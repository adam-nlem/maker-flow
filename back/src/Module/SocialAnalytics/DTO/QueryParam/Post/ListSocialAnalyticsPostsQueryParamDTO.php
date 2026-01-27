<?php

namespace App\Module\SocialAnalytics\DTO\QueryParam\Post;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListSocialAnalyticsPostsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $integrationUuid;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $page;

    #[Assert\NotBlank]
    #[Assert\Positive]
    private int $limit;

    #[Assert\NotBlank]
    private SocialAnalyticsTimePeriod $timePeriod;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->integrationUuid = $queryParams["integrationUuid"] ?? "";
        $this->page = $queryParams["page"];
        $this->limit = $queryParams["limit"];
        $this->timePeriod = SocialAnalyticsTimePeriod::tryFrom($queryParams["timePeriod"] ?? "")
            ?? SocialAnalyticsTimePeriod::Last7Days;
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }

    public function getPage(): int
    {
        return $this->page;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }

    public function getTimePeriod(): SocialAnalyticsTimePeriod
    {
        return $this->timePeriod;
    }
}
