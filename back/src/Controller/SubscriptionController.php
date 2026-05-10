<?php

namespace App\Controller;

use App\DTO\Request\Subscription\ChangePlanRequestDTO;
use App\DTO\Request\Subscription\CreateSubscriptionCheckoutRequestDTO;
use App\DTO\Response\Subscription\CreateSubscriptionCheckoutResponseDTO;
use App\DTO\Response\Subscription\ListPlansResponseDTO;
use App\Entity\Enum\UserRole;
use App\Entity\User;
use App\Exception\Agency\MissingAgencyException;
use App\Exception\Stripe\SubscriptionNotFoundException;
use App\Repository\AgencyRepository;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\StripeCheckoutService;
use App\Service\Stripe\StripePlanService;
use App\Service\Stripe\StripeSubscriptionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/subscriptions')]
final class SubscriptionController extends AbstractController
{
    #[Route('/plans', name: 'api_subscriptions_plans_list', methods: ['GET'])]
    #[IsGranted(UserRole::User->value)]
    public function plans(StripePlanService $stripePlanService): JsonResponse
    {
        $plans = $stripePlanService->getPlanConfigs();

        $responseDto = new ListPlansResponseDTO($plans);

        return $this->json(
            data: $responseDto->getData(),
            status: Response::HTTP_OK,
            context: ['groups' => ['api_subscriptions_plans_list']],
        );
    }

    #[Route('/checkout', name: 'api_subscriptions_checkout', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function checkout(
        CreateSubscriptionCheckoutRequestDTO $dto,
        AgencyRepository $agencyRepository,
        StripeCheckoutService $stripeCheckoutService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $dto->build();

        $checkoutUrl = $stripeCheckoutService->createSubscriptionCheckoutSession($agency, $dto->getPlan(), $dto->getCheckoutRedirectPath());

        $responseDto = new CreateSubscriptionCheckoutResponseDTO($checkoutUrl);

        return $this->json(data: $responseDto->getData(), status: Response::HTTP_OK);
    }

    #[Route('/current', name: 'api_subscriptions_current', methods: ['GET'])]
    #[IsGranted(UserRole::Viewer->value)]
    public function current(
        AgencyRepository $agencyRepository,
        SubscriptionRepository $subscriptionRepository,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $subscription = $subscriptionRepository->getLatestActiveByAgency($agency);

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }

    #[Route('/cancel', name: 'api_subscriptions_cancel', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function cancel(
        AgencyRepository $agencyRepository,
        SubscriptionRepository $subscriptionRepository,
        StripeSubscriptionService $stripeSubscriptionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $subscription = $subscriptionRepository->getLatestByAgency($agency);

        if ($subscription === null) {
            throw new SubscriptionNotFoundException();
        }

        $stripeSubscriptionService->cancelSubscription($subscription);

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }

    #[Route('/resume', name: 'api_subscriptions_resume', methods: ['POST'])]
    #[IsGranted(UserRole::Admin->value)]
    public function resume(
        AgencyRepository $agencyRepository,
        SubscriptionRepository $subscriptionRepository,
        StripeSubscriptionService $stripeSubscriptionService,
    ): JsonResponse {
        /** @var User $user */
        $user = $this->getUser();

        $agency = $agencyRepository->getByCollaborator($user);

        if ($agency === null) {
            throw new MissingAgencyException();
        }

        $subscription = $subscriptionRepository->getLatestByAgency($agency);

        if ($subscription === null) {
            throw new SubscriptionNotFoundException();
        }

        $stripeSubscriptionService->resumeSubscription($subscription);

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }
}
