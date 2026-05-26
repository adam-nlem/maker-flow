<?php

namespace App\Service\Stripe;

use App\Entity\Agency;
use App\Entity\Enum\SubscriptionPlan;
use App\Repository\AgencyRepository;
use App\Repository\UserRepository;
use App\Exception\Stripe\CheckoutSessionCreationException;
use Stripe\Checkout\Session;
use Stripe\Customer;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class StripeCheckoutService
{
    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly string $frontendUrl,
        private readonly AgencyRepository $agencyRepository,
        private readonly UserRepository $userRepository,
        private readonly StripePlanService $stripePlanService,
        private readonly StripeRefillService $stripeRefillService,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    public function getOrCreateStripeCustomer(Agency $agency): string
    {
        $adminEmail = $this->userRepository->getAdminByAgency($agency)?->getEmail();

        if ($agency->getStripeCustomerId() !== null) {
            $this->syncCustomerEmail($agency->getStripeCustomerId(), $adminEmail);

            return $agency->getStripeCustomerId();
        }

        try {
            $customer = Customer::create([
                'email' => $adminEmail,
                'name' => $agency->getName(),
                'metadata' => [
                    'agency_uuid' => $agency->getUuid(),
                ],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException('Failed to create Stripe customer', $e);
        }

        $agency->setStripeCustomerId($customer->id);
        $this->agencyRepository->save($agency, true);

        return $customer->id;
    }

    private function syncCustomerEmail(string $customerId, ?string $email): void
    {
        if ($email === null) {
            return;
        }

        try {
            Customer::update($customerId, ['email' => $email]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException('Failed to sync Stripe customer email', $e);
        }
    }

    /**
     * @throws CheckoutSessionCreationException
     */
    public function createSubscriptionCheckoutSession(Agency $agency, SubscriptionPlan $plan, string $checkoutRedirectPath = '/agency/settings/subscription'): string
    {
        $priceId = $this->stripePlanService->getPriceIdForPlan($plan);

        if ($priceId === null) {
            throw new CheckoutSessionCreationException('No price found for plan: ' . $plan->value);
        }
        $customerId = $this->getOrCreateStripeCustomer($agency);

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
                    'agency_uuid' => $agency->getUuid(),
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
    public function createRefillCheckoutSession(Agency $agency): string
    {
        $priceId = $this->stripeRefillService->getRefillPriceId();

        if ($priceId === null) {
            throw new CheckoutSessionCreationException('No refill price found in Stripe');
        }

        $customerId = $this->getOrCreateStripeCustomer($agency);

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
                'success_url' => $this->frontendUrl . '/agency/settings/subscription?checkout=success',
                'cancel_url' => $this->frontendUrl . '/agency/settings/subscription?checkout=cancel',
                'metadata' => [
                    'agency_uuid' => $agency->getUuid(),
                ],
            ]);
        } catch (ApiErrorException $e) {
            throw new CheckoutSessionCreationException($e->getMessage(), $e);
        }

        return $session->url;
    }

}
