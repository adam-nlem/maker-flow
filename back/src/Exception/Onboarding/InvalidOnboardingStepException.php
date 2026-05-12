<?php

namespace App\Exception\Onboarding;

use Symfony\Component\HttpFoundation\Response;

final class InvalidOnboardingStepException extends OnboardingException
{
    public const CODE = 1;

    public function __construct()
    {
        parent::__construct(
            'The submitted onboarding step is not applicable to the current user.',
            self::CODE,
            Response::HTTP_BAD_REQUEST,
        );
    }
}
