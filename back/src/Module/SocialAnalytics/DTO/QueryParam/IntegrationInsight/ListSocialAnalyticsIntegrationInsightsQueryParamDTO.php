<?php

namespace App\Module\SocialAnalytics\DTO\QueryParam\IntegrationInsight;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ListSocialAnalyticsIntegrationInsightsQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $integrationUuid;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromQueryParams(array $queryParams): void
    {
        $this->integrationUuid = $queryParams["integrationUuid"] ?? "";
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }
}
