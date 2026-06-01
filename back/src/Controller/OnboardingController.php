<?php

namespace App\Controller;

use App\DTO\Request\Onboarding\CompleteOnboardingStepRequestDTO;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Service\OnboardingService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/onboarding')]
final class OnboardingController extends AbstractController
{
    #[Route('', name: 'api_onboarding_show', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function show(OnboardingService $onboardingService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $onboarding = $onboardingService->getOrCreateOnboarding($user);

        return $this->json(data: $onboarding, status: Response::HTTP_OK, context: ['groups' => ['api_onboarding_show']]);
    }

    #[Route('/complete-step', name: 'api_onboarding_complete_step', methods: ['POST'])]
    #[IsGranted(UserRole::User->value)]
    public function completeStep(CompleteOnboardingStepRequestDTO $dto, OnboardingService $onboardingService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $onboarding = $onboardingService->getOrCreateOnboarding($user);
        $onboarding = $onboardingService->completeStep($onboarding, $dto->getStep(), $user);

        return $this->json(data: $onboarding, status: Response::HTTP_OK, context: ['groups' => ['api_onboarding_complete_step']]);
    }

    #[Route('/dismiss', name: 'api_onboarding_dismiss', methods: ['POST'])]
    #[IsGranted(UserRole::User->value)]
    public function dismiss(OnboardingService $onboardingService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $onboarding = $onboardingService->getOrCreateOnboarding($user);
        $onboarding = $onboardingService->dismiss($onboarding);

        return $this->json(data: $onboarding, status: Response::HTTP_OK, context: ['groups' => ['api_onboarding_dismiss']]);
    }
}
