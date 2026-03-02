<?php

namespace App\DTO\Request\Subscription;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\SubscriptionPlan;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateSubscriptionCheckoutRequestDTO extends AbstractRequestDTO
{
    private SubscriptionPlan $plan;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->plan = SubscriptionPlan::from($payload["plan"]);
    }

    public function buildObject(): mixed
    {
        return null;
    }

    public function getPlan(): SubscriptionPlan
    {
        return $this->plan;
    }
}
