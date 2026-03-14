<?php

namespace App\Service\Stripe;

use App\Entity\Enum\SubscriptionPlan;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Stripe\Exception\CheckoutSessionCreationException;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class StripeCheckoutService
{
    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly string $frontendUrl,
        private readonly UserRepository $userRepository,
        private readonly StripePlanService $stripePlanService,
        private readonly StripeRefillService $stripeRefillService,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    public function getOrCreateStripeCustomer(User $user): string
    {
        if ($user->getStripeCustomerId() !== null) {
            return $user->getStripeCustomerId();
        }

        try {
            $customer = Customer::create([
                'email' => $user->getEmail(),
                'name' => $user->getFirstName() . ' ' . $user->getLastName(),
                'metadata' => [
                    'user_uuid' => $user->getUuid(),
                ],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException('Failed to create Stripe customer', $e);
        }

        $user->setStripeCustomerId($customer->id);
        $this->userRepository->save($user, true);

        return $customer->id;
    }

    /**
     * @throws CheckoutSessionCreationException
     */
    public function createSubscriptionCheckoutSession(User $user, SubscriptionPlan $plan, string $checkoutRedirectPath = '/settings/subscription'): string
    {
        $priceId = $this->stripePlanService->getPriceIdForPlan($plan);

        if ($priceId === null) {
            throw new CheckoutSessionCreationException('No price found for plan: ' . $plan->value);
        }
        $customerId = $this->getOrCreateStripeCustomer($user);

        try {
            $session = Session::create([
                'mode' => 'subscription',
                'customer' => $customerId,
                'line_items' => [
                    [
                        'price' => $priceId,
                        'quantity' => 1,
                    ],
                ],
                'success_url' => $this->frontendUrl . $checkoutRedirectPath . '?checkout=success',
                'cancel_url' => $this->frontendUrl . $checkoutRedirectPath . '?checkout=cancel',
                'metadata' => [
                    'user_uuid' => $user->getUuid(),
                ],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException($e->getMessage(), $e);
        }

        return $session->url;
    }

    /**
     * @throws CheckoutSessionCreationException
     */
    public function createRefillCheckoutSession(User $user): string
    {
        $priceId = $this->stripeRefillService->getRefillPriceId();

        if ($priceId === null) {
            throw new CheckoutSessionCreationException('No refill price found in Stripe');
        }

        $customerId = $this->getOrCreateStripeCustomer($user);

        try {
            $session = Session::create([
                'mode' => 'payment',
                'customer' => $customerId,
                'line_items' => [
                    [
                        'price' => $priceId,
                        'quantity' => 1,
                    ],
                ],
                'success_url' => $this->frontendUrl . '/settings/subscription?checkout=success',
                'cancel_url' => $this->frontendUrl . '/settings/subscription?checkout=cancel',
                'metadata' => [
                    'user_uuid' => $user->getUuid(),
                ],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException($e->getMessage(), $e);
        }

        return $session->url;
    }

}
