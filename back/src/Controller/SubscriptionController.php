<?php

namespace App\Controller;

use App\DTO\Request\Subscription\ChangePlanRequestDTO;
use App\DTO\Request\Subscription\CreateSubscriptionCheckoutRequestDTO;
use App\DTO\Response\Subscription\CreateSubscriptionCheckoutResponseDTO;
use App\Entity\User;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\Exception\CheckoutSessionCreationException;
use App\Service\Stripe\Exception\SubscriptionManagementException;
use App\Service\Stripe\StripeCheckoutService;
use App\Service\Stripe\StripeSubscriptionService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/subscriptions')]
final class SubscriptionController extends AbstractController
{
    #[Route('/checkout', name: 'api_subscriptions_checkout', methods: ['POST'])]
    public function checkout(CreateSubscriptionCheckoutRequestDTO $dto, StripeCheckoutService $stripeCheckoutService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $dto->build();

        try {
            $checkoutUrl = $stripeCheckoutService->createSubscriptionCheckoutSession($user, $dto->getPlan());
        } catch (CheckoutSessionCreationException $e) {
            return $this->json(data: ["message" => $e->getMessage()], status: Response::HTTP_BAD_REQUEST);
        }

        $responseDto = new CreateSubscriptionCheckoutResponseDTO($checkoutUrl);

        return $this->json(data: $responseDto->getData(), status: Response::HTTP_OK);
    }

    #[Route('/current', name: 'api_subscriptions_current', methods: ['GET'])]
    public function current(SubscriptionRepository $subscriptionRepository): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $subscription = $subscriptionRepository->getByUser($user);

        if ($subscription === null) {
            return $this->json(data: ["message" => "No active subscription found"], status: Response::HTTP_NOT_FOUND);
        }

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }

    #[Route('/cancel', name: 'api_subscriptions_cancel', methods: ['POST'])]
    public function cancel(SubscriptionRepository $subscriptionRepository, StripeSubscriptionService $stripeSubscriptionService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $subscription = $subscriptionRepository->getByUser($user);

        if ($subscription === null) {
            return $this->json(data: ["message" => "No active subscription found"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            $stripeSubscriptionService->cancelSubscription($subscription);
        } catch (SubscriptionManagementException $e) {
            return $this->json(data: ["message" => $e->getMessage()], status: Response::HTTP_BAD_REQUEST);
        }

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }

    #[Route('/resume', name: 'api_subscriptions_resume', methods: ['POST'])]
    public function resume(SubscriptionRepository $subscriptionRepository, StripeSubscriptionService $stripeSubscriptionService): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $subscription = $subscriptionRepository->getByUser($user);

        if ($subscription === null) {
            return $this->json(data: ["message" => "No active subscription found"], status: Response::HTTP_NOT_FOUND);
        }

        try {
            $stripeSubscriptionService->resumeSubscription($subscription);
        } catch (SubscriptionManagementException $e) {
            return $this->json(data: ["message" => $e->getMessage()], status: Response::HTTP_BAD_REQUEST);
        }

        return $this->json(data: $subscription, status: Response::HTTP_OK, context: ['groups' => ['api_subscription_show']]);
    }
}
