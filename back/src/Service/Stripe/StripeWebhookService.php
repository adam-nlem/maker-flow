<?php

namespace App\Service\Stripe;

use App\Entity\Enum\StripeEventType;
use App\Entity\Enum\SubscriptionPlan;
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
        private readonly LoggerInterface $log,
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
        $this->log->info('Processing Checkout');
        $session = $payload['data']['object'];
        $this->log->info('Extracted session');

        // Subscriptions will be processed by the handleCustomerSubscriptionCreated method
        if ($session['mode'] !== 'payment') {
            return;
        }

        $this->log->info('Is payment');

        $customerId = $session['customer'];
        $user = $this->userRepository->getByStripeCustomerId($customerId);

        if ($user === null) {
            $this->log->warning('Checkout session completed but user not found', ['customerId' => $customerId]);
            return;
        }

        $sessionId = $session['id'];
        $paymentIntentId = $session['payment_intent'] ?? null;

        $lineItems = Session::allLineItems($sessionId);

        if (empty($lineItems)) {
            $this->log->warning('Checkout session has no line items', ['sessionId' => $sessionId]);
            return;
        }

        $priceId = $lineItems->data[0]->price->id;
        $price = Price::retrieve($priceId);
        $creditAmount = (int) ($price->metadata->credit_amount ?? 0);

        if ($creditAmount <= 0) {
            $this->log->warning('No credit_amount metadata on price', [
                'sessionId' => $sessionId,
                'priceId' => $lineItems[0]->price->id,
            ]);
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
            $this->log->warning('Subscription created but user not found', ['customerId' => $customerId]);
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
            $this->log->warning('Could not resolve plan from price ID', ['priceId' => $priceId]);
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
            $this->log->warning('Subscription updated but not found locally', [
                'stripeSubscriptionId' => $subscriptionData['id'],
            ]);
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
            $this->log->warning('Subscription deleted but not found locally', [
                'stripeSubscriptionId' => $subscriptionData['id'],
            ]);
            return;
        }

        $subscription->setStatus(SubscriptionStatus::Canceled);
        $this->subscriptionRepository->save($subscription, true);
    }

    private function handleInvoicePaid(array $payload): void
    {
        $invoiceData = $payload['data']['object'];

        $stripeSubscriptionId = $invoiceData['subscription'] ?? null;

        if ($stripeSubscriptionId === null) {
            return;
        }

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($stripeSubscriptionId);

        if ($subscription === null) {
            $this->log->warning('Invoice paid but subscription not found locally', [
                'stripeSubscriptionId' => $stripeSubscriptionId,
            ]);
            return;
        }

        $invoiceId = $invoiceData['id'];
        $lineItems = $invoiceData['lines']['data'] ?? [];

        if (empty($lineItems)) {
            $this->log->warning('Invoice has no line items', ['invoiceId' => $invoiceId]);
            return;
        }

        $creditAmount = (int) ($lineItems[0]['price']['metadata']['credit_amount'] ?? 0);

        if ($creditAmount <= 0) {
            $this->log->warning('No credit_amount metadata on invoice line item price', [
                'invoiceId' => $invoiceId,
                'priceId' => $lineItems[0]['price']['id'] ?? null,
            ]);
            return;
        }

        $user = $subscription->getUser();
        $this->creditService->renewSubscriptionCredits($user, $creditAmount, $invoiceId);
    }

    private function handleInvoicePaymentFailed(array $payload): void
    {
        $invoiceData = $payload['data']['object'];

        $stripeSubscriptionId = $invoiceData['subscription'] ?? null;

        if ($stripeSubscriptionId === null) {
            return;
        }

        $subscription = $this->subscriptionRepository->getByStripeSubscriptionId($stripeSubscriptionId);

        if ($subscription === null) {
            $this->log->warning('Invoice payment failed but subscription not found locally', [
                'stripeSubscriptionId' => $stripeSubscriptionId,
            ]);
            return;
        }

        $subscription->setStatus(SubscriptionStatus::PastDue);
        $this->subscriptionRepository->save($subscription, true);
    }

    
}
