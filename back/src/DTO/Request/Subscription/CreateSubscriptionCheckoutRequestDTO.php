<?php

namespace App\DTO\Request\Subscription;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\SubscriptionPlan;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CreateSubscriptionCheckoutRequestDTO extends AbstractRequestDTO
{
    private SubscriptionPlan $plan;
    private string $checkoutRedirectPath = '/agency/settings/subscription';

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    public function fromPayload(array $payload)
    {
        $this->plan = SubscriptionPlan::tryFrom($payload["plan"]);
        $this->checkoutRedirectPath = $payload["checkoutRedirectPath"] ?? '/agency/settings/subscription';
    }

    public function buildObject(): mixed
    {
        return ['plan' => $this->getPlan()];
    }

    public function getPlan(): SubscriptionPlan
    {
        return $this->plan;
    }

    public function getCheckoutRedirectPath(): string
    {
        return $this->checkoutRedirectPath;
    }
}
