<?php

namespace App\DTO\Request\Onboarding;

use App\DTO\Request\AbstractRequestDTO;
use App\Entity\Enum\OnboardingStep;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CompleteOnboardingStepRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    private OnboardingStep $step;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->step = OnboardingStep::tryFrom($payload["step"]);
    }

    protected function buildObject(): array
    {
        return [
            'step' => $this->step,
        ];
    }

    public function getStep(): OnboardingStep
    {
        return $this->step;
    }
}
