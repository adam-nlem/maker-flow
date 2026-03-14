<?php

namespace App\Service\Stripe;

use App\Entity\Subscription;
use App\Repository\SubscriptionRepository;
use App\Service\Stripe\Exception\SubscriptionManagementException;
use Psr\Log\LoggerInterface;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;
use Stripe\Subscription as StripeSubscription;

class StripeSubscriptionService
{
    public function __construct(
        private readonly string $stripeSecretKey,
        private readonly SubscriptionRepository $subscriptionRepository,
        private readonly LoggerInterface $log,
    ) {
        Stripe::setApiKey($this->stripeSecretKey);
    }

    /**
     * @throws SubscriptionManagementException
     */
    public function cancelSubscription(Subscription $subscription): void
    {
        try {
            StripeSubscription::update($subscription->getStripeSubscriptionId(), [
                'cancel_at_period_end' => true,
            ]);
        } catch (ApiErrorException $e) {
            $this->log->error('Failed to cancel subscription on Stripe', [
                'stripeSubscriptionId' => $subscription->getStripeSubscriptionId(),
                'error' => $e->getMessage(),
            ]);

            throw new SubscriptionManagementException('Failed to cancel subscription', $e);
        }

        $subscription->setCancelAtPeriodEnd(true);
        $this->subscriptionRepository->save($subscription, true);
    }

    /**
     * @throws SubscriptionManagementException
     */
    public function resumeSubscription(Subscription $subscription): void
    {
        if (!$subscription->isCancelAtPeriodEnd()) {
            throw new SubscriptionManagementException('Subscription is not scheduled for cancellation');
        }

        try {
            StripeSubscription::update($subscription->getStripeSubscriptionId(), [
                'cancel_at_period_end' => false,
            ]);
        } catch (ApiErrorException $e) {
            $this->log->error('Failed to resume subscription on Stripe', [
                'stripeSubscriptionId' => $subscription->getStripeSubscriptionId(),
                'error' => $e->getMessage(),
            ]);

            throw new SubscriptionManagementException('Failed to resume subscription', $e);
        }

        $subscription->setCancelAtPeriodEnd(false);
        $this->subscriptionRepository->save($subscription, true);
    }
}
