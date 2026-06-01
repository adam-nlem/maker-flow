<?php

namespace App\DTO\Request\Onboarding;

use App\DTO\Request\AbstractRequestDTO;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class CompleteOnboardingStepRequestDTO extends AbstractRequestDTO
{
    #[Assert\NotBlank]
    private string $step;

    public function __construct(
        protected RequestStack $requestStack,
        protected ValidatorInterface $validator,
    ) {
        parent::__construct($requestStack, $validator);
    }

    protected function fromPayload(array $payload): void
    {
        $this->step = (string) ($payload["step"] ?? '');
    }

    protected function buildObject(): array
    {
        return [
            'step' => $this->step,
        ];
    }

    public function getStep(): string
    {
        return $this->step;
    }
}
