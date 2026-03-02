<?php

namespace App\Service\Stripe;

use App\Entity\Enum\SubscriptionPlan;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\Stripe\Exception\CheckoutSessionCreationException;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class StripeCheckoutService
{
    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly string $stripePriceStarter,
        private readonly string $stripePriceCreator,
        private readonly string $stripePriceAgency,
        private readonly string $stripePriceTopup,
        private readonly string $frontendUrl,
        private readonly UserRepository $userRepository,
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
    public function createSubscriptionCheckoutSession(User $user, SubscriptionPlan $plan): string
    {
        $priceId = $this->resolvePriceId($plan);
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

    /**
     * @throws CheckoutSessionCreationException
     */
    public function createTopupCheckoutSession(User $user): string
    {
        $customerId = $this->getOrCreateStripeCustomer($user);

        try {
            $session = Session::create([
                'mode' => 'payment',
                'customer' => $customerId,
                'line_items' => [
                    [
                        'price' => $this->stripePriceTopup,
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

    /**
     * @throws CheckoutSessionCreationException
     */
    private function resolvePriceId(SubscriptionPlan $plan): string
    {
        return match ($plan) {
            SubscriptionPlan::Starter => $this->stripePriceStarter,
            SubscriptionPlan::Creator => $this->stripePriceCreator,
            SubscriptionPlan::Agency => $this->stripePriceAgency,
            SubscriptionPlan::Free => throw new CheckoutSessionCreationException('Cannot create checkout session for free plan'),
        };
    }
}
