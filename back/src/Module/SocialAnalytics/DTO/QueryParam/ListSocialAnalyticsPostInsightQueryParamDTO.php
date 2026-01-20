<?php

namespace App\Module\SocialAnalytics\DTO\QueryParam;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListSocialAnalyticsPostInsightQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $postUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->postUuid = $queryParams["postUuid"] ?? "";
    }

    public function getPostUuid(): string
    {
        return $this->postUuid;
    }
}
