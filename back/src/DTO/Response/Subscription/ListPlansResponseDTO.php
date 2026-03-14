<?php

namespace App\DTO\Response\Subscription;

use App\DTO\Response\ResponseDTOInterface;
use Symfony\Component\Serializer\Attribute\Groups;

class ListPlansResponseDTO implements ResponseDTOInterface
{
    /**
     * @param PlanConfigResponseDTO[] $plans
     */
    public function __construct(
        #[Groups(['api_subscriptions_plans_list'])]
        private array $plans,
    ) {}

    public function getData(): array
    {
        return array_map(fn(PlanConfigResponseDTO $plan) => $plan->getData(), $this->getPlans());
    }

    public function getPlans(): array
    {
        return $this->plans;
    }
}
