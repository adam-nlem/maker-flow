<?php

namespace App\Module\SocialAnalytics\DTO\QueryParam;

use App\DTO\QueryParam\AbstractQueryParamDTO;
use App\Module\SocialAnalytics\Entity\Enum\SocialAnalyticsTimePeriod;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class ShowSocialAnalyticsIntegrationOverviewQueryParamDTO extends AbstractQueryParamDTO
{
    #[Assert\NotBlank]
    private string $integrationUuid;

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
        $this->timePeriod = SocialAnalyticsTimePeriod::tryFrom($queryParams["timePeriod"] ?? "") 
            ?? SocialAnalyticsTimePeriod::Last30Days;
    }

    public function getIntegrationUuid(): string
    {
        return $this->integrationUuid;
    }

    public function getTimePeriod(): SocialAnalyticsTimePeriod
    {
        return $this->timePeriod;
    }
}
