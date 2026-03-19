<?php

namespace App\Service\Stripe;

use App\Entity\Enum\StripeEventType;
use App\Entity\Enum\SubscriptionStatus;
use App\Entity\Subscription;
use App\Entity\StripeWebhookEvent;
use App\Repository\SubscriptionRepository;
use App\Repository\UserRepository;
use App\Service\Credit\CreditService;
use App\Service\Stripe\Exception\WebhookSignatureVerificationException;
use Psr\Log\LoggerInterface;
use Stripe\Checkout\Session;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Price;
use Stripe\Stripe;
use Stripe\Webhook;

class StripeWebhookService
{
    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly string $stripeWebhookSecret,
        private readonly UserRepository $userRepository,
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly CreditService $creditService,
        private readonly StripePlanService $stripePlanService,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    /**
     * @throws WebhookSignatureVerificationException
     */
    public function constructEvent(string $payload, string $signature): \Stripe\Event
    {
        try {
            return Webhook::constructEvent($payload, $signature, $this->stripeWebhookSecret);
        } catch (SignatureVerificationException $e) {
            throw new WebhookSignatureVerificationException($e);
        }
    }

    public function processEvent(StripeWebhookEvent $event): void
    {
        $payload = $event->getPayload();

        match ($event->getEventType()) {
            StripeEventType::CheckoutSessionCompleted => $this->handleCheckoutSessionCompleted($payload),
            StripeEventType::CustomerSubscriptionCreated => $this->handleCustomerSubscriptionCreated($payload),
            StripeEventType::CustomerSubscriptionUpdated => $this->handleCustomerSubscriptionUpdated($payload),
            StripeEventType::CustomerSubscriptionDeleted => $this->handleCustomerSubscriptionDeleted($payload),
            StripeEventType::InvoicePaid => $this->handleInvoicePaid($payload),
            StripeEventType::InvoicePaymentFailed => $this->handleInvoicePaymentFailed($payload),
        };
    }

    private function handleCheckoutSessionCompleted(array $payload): void
    {
        $session = $payload['data']['object'];

        // Subscriptions will be processed by the handleCustomerSubscriptionCreated method
        if ($session['mode'] !== 'payment') {
            return;
        }

        $customerId = $session['customer'];
        $user = $this->userRepository->getByStripeCustomerId($customerId);

        if ($user === null) {
            return;
        }

        $sessionId = $session['id'];
        $paymentIntentId = $session['payment_intent'] ?? null;

        $lineItems = Session::allLineItems($sessionId);

        if (empty($lineItems)) {
            return;
        }

        $priceId = $lineItems->data[0]->price->id;
        $price = Price::retrieve($priceId);
        $creditAmount = (int) ($price->metadata->credit_amount ?? 0);

        if ($creditAmount <= 0) {
            return;
        }

        $this->creditService->addRefillCredits($user, $creditAmount, $paymentIntentId);
    }

    private function handleCustomerSubscriptionCreated(array $payload): void
    {
        $subscriptionData = $payload['data']['object'];

        $customerId = $subscriptionData['customer'];
        $user = $this->userRepository->getByStripeCustomerId($customerId);

        if ($user === null) {
            return;
        }

        $existingSubscription = $this->subscriptionRepository->getByStripeSubscriptionId($subscriptionData['id']);

        if ($existingSubscription !== null) {
            return;
        }

        $item = $subscriptionData['items']['data'][0] ?? [];
        $priceId = $item['price']['id'] ?? null;
        $plan = $priceId !== null ? $this->stripePlanService->resolvePlanFromPriceId($priceId) : null;

        if ($plan === null) {
            return;
        }

        $status = SubscriptionStatus::tryFrom($subscriptionData['status']) ?? SubscriptionStatus::Incomplete;

        $subscription = new Subscription();
        $subscription->setUser($user)
            ->setStripeSubscriptionId($subscriptionData['id'])
            ->setPlan($plan)
            ->setStatus($status)
            ->setCurrentPeriodStart(new \DateTimeImmutable('@' . $item['current_period_start']))
            ->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $item['current_period_end']))
            ->setCancelAtPeriodEnd($subscriptionData['cancel_at_period_end'] ?? false);

        $this->subscriptionRepository->save($subscription, true);
    }

    private function handleCustomerSubscriptionUpdated(array $payload): void
    {
        $subscriptionData = $payload['data']['object'];

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($subscriptionData['id']);

        if ($subscription === null) {
            return;
        }

        $status = SubscriptionStatus::tryFrom($subscriptionData['status']);

        if ($status !== null) {
            $subscription->setStatus($status);
        }

        $item = $subscriptionData['items']['data'][0] ?? [];

        $subscription->setCurrentPeriodStart(new \DateTimeImmutable('@' . $item['current_period_start']))
            ->setCurrentPeriodEnd(new \DateTimeImmutable('@' . $item['current_period_end']))
            ->setCancelAtPeriodEnd($subscriptionData['cancel_at_period_end'] ?? false);

        $priceId = $item['price']['id'] ?? null;

        if ($priceId !== null) {
            $plan = $this->stripePlanService->resolvePlanFromPriceId($priceId);

            if ($plan !== null) {
                $subscription->setPlan($plan);
            }
        }

        $this->subscriptionRepository->save($subscription, true);
    }

    private function handleCustomerSubscriptionDeleted(array $payload): void
    {
        $subscriptionData = $payload['data']['object'];

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($subscriptionData['id']);

        if ($subscription === null) {
            return;
        }

        $subscription->setStatus(SubscriptionStatus::Canceled);
        $this->subscriptionRepository->save($subscription, true);
    }

    private function handleInvoicePaid(array $payload): void
    {

        $invoiceData = $payload['data']['object'];

        $stripeSubscriptionId = $invoiceData['parent']['subscription_details']['subscription'] ?? null;

        if ($stripeSubscriptionId === null) {
            return;
        }

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($stripeSubscriptionId);


        if ($subscription !== null) {
            $user = $subscription->getUser();
        } else {
            $customerId = $invoiceData['customer'] ?? null;
            $user = $customerId !== null ? $this->userRepository->getByStripeCustomerId($customerId) : null;

            if ($user === null) {
                return;
            }
        }

        $invoiceId = $invoiceData['id'];
        $lineItems = $invoiceData['lines']['data'] ?? [];
        if (empty($lineItems)) {
            return;
        }

        $priceId = $lineItems[0]['pricing']['price_details']['price'] ?? null;
        if ($priceId === null) {
            return;
        }

        $price = Price::retrieve($priceId);
        $creditAmount = (int) ($price->metadata->credit_amount ?? 0);
        if ($creditAmount <= 0) {
            return;
        }
        $this->creditService->renewSubscriptionCredits($user, $creditAmount, $invoiceId);
    }

    private function handleInvoicePaymentFailed(array $payload): void
    {
        $invoiceData = $payload['data']['object'];

        $stripeSubscriptionId = $invoiceData['parent']['subscription_details']['subscription'] ?? null;

        if ($stripeSubscriptionId === null) {
            return;
        }

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($stripeSubscriptionId);

        if ($subscription === null) {
            return;
        }

        $subscription->setStatus(SubscriptionStatus::PastDue);
        $this->subscriptionRepository->save($subscription, true);
    }
}
