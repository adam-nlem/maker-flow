<?php

namespace App\Service\Credit;

use App\Entity\CreditBalance;
use App\Entity\CreditTransaction;
use App\Entity\Enum\CreditTransactionType;
use App\Entity\Enum\SourceBucket;
use App\Entity\User;
use App\Repository\CreditBalanceRepository;
use App\Repository\CreditTransactionRepository;
use App\Service\Credit\Exception\InsufficientCreditsException;
use Doctrine\ORM\EntityManagerInterface;

class CreditService
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly CreditBalanceRepository $creditBalanceRepository,
        private readonly CreditTransactionRepository $creditTransactionRepository,
    ) {}

    public function getOrCreateBalance(User $user): CreditBalance
    {
        $balance = $this->creditBalanceRepository->getByUser($user);

        if ($balance !== null) {
            return $balance;
        }

        $balance = new CreditBalance();
        $balance->setUser($user);
        $this->creditBalanceRepository->save($balance, true);

        return $balance;
    }

    public function addRefillCredits(
        User $user,
        int $amount,
        ?string $stripePaymentIntentId = null,
        ?string $stripeInvoiceId = null,
    ): CreditTransaction {
        $this->entityManager->beginTransaction();

        try {
            $balance = $this->getOrCreateBalance($user);

            $balance->setRefillCredits($balance->getRefillCredits() + $amount);

            $transaction = $this->createTransaction(
                user: $user,
                balance: $balance,
                amount: $amount,
                type: CreditTransactionType::RefillPurchase,
                bucket: SourceBucket::RefillCredits,
                stripePaymentIntentId: $stripePaymentIntentId,
                stripeInvoiceId: $stripeInvoiceId,
            );

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $transaction;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    public function renewSubscriptionCredits(
        User $user,
        int $planCredits,
        ?string $stripeInvoiceId = null,
    ): CreditTransaction {
        $this->entityManager->beginTransaction();

        try {
            $balance = $this->getOrCreateBalance($user);

            $delta = $planCredits - $balance->getSubscriptionCredits();
            $balance->setSubscriptionCredits($planCredits);

            $transaction = $this->createTransaction(
                user: $user,
                balance: $balance,
                amount: $delta,
                type: CreditTransactionType::SubscriptionRenewal,
                bucket: SourceBucket::SubscriptionCredits,
                stripeInvoiceId: $stripeInvoiceId,
            );

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $transaction;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    public function refundCredit(
        User $user,
        int $amount,
        CreditTransactionType $type,
        SourceBucket $bucket,
        ?string $description = null,
    ): CreditTransaction {
        $this->entityManager->beginTransaction();

        try {
            $balance = $this->getOrCreateBalance($user);

            if ($bucket === SourceBucket::SubscriptionCredits) {
                $balance->setSubscriptionCredits($balance->getSubscriptionCredits() + $amount);
            } else {
                $balance->setRefillCredits($balance->getRefillCredits() + $amount);
            }

            $transaction = $this->createTransaction(
                user: $user,
                balance: $balance,
                amount: $amount,
                type: $type,
                bucket: $bucket,
                description: $description,
            );

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $transaction;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    /**
     * @return CreditTransaction[]
     * @throws InsufficientCreditsException
     */
    public function debitCredits(
        User $user,
        int $amount,
        CreditTransactionType $type,
    ): array {
        $this->entityManager->beginTransaction();

        try {
            $balance = $this->creditBalanceRepository->getByUserWithLock($user);

            if ($balance === null || $balance->getTotalCredits() < $amount) {
                $this->entityManager->rollback();
                throw new InsufficientCreditsException(
                    requested: $amount,
                    available: $balance?->getTotalCredits() ?? 0,
                );
            }

            $fromSubscription = min($balance->getSubscriptionCredits(), $amount);
            $fromRefill = $amount - $fromSubscription;

            $transactions = [];

            if ($fromSubscription > 0) {
                $balance->setSubscriptionCredits($balance->getSubscriptionCredits() - $fromSubscription);

                $transactions[] = $this->createTransaction(
                    user: $user,
                    balance: $balance,
                    amount: -$fromSubscription,
                    type: $type,
                    bucket: SourceBucket::SubscriptionCredits,
                );
            }

            if ($fromRefill > 0) {
                $balance->setRefillCredits($balance->getRefillCredits() - $fromRefill);

                $transactions[] = $this->createTransaction(
                    user: $user,
                    balance: $balance,
                    amount: -$fromRefill,
                    type: $type,
                    bucket: SourceBucket::RefillCredits,
                );
            }

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $transactions;
        } catch (InsufficientCreditsException $e) {
            throw $e;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    public function addWelcomeCredits(User $user, int $amount): CreditTransaction
    {
        $this->entityManager->beginTransaction();

        try {
            $balance = $this->getOrCreateBalance($user);

            $balance->setRefillCredits($balance->getRefillCredits() + $amount);

            $transaction = $this->createTransaction(
                user: $user,
                balance: $balance,
                amount: $amount,
                type: CreditTransactionType::WelcomeBonus,
                bucket: SourceBucket::RefillCredits,
            );

            $this->entityManager->flush();
            $this->entityManager->commit();

            return $transaction;
        } catch (\Throwable $e) {
            $this->entityManager->rollback();
            throw $e;
        }
    }

    public function getTotalCredits(User $user): int
    {
        $balance = $this->getOrCreateBalance($user);

        return $balance->getTotalCredits();
    }

    private function createTransaction(
        User $user,
        CreditBalance $balance,
        int $amount,
        CreditTransactionType $type,
        SourceBucket $bucket,
        ?string $stripePaymentIntentId = null,
        ?string $stripeInvoiceId = null,
        ?string $description = null,
    ): CreditTransaction {
        $transaction = new CreditTransaction();
        $transaction->setUser($user)
            ->setCreditBalance($balance)
            ->setAmount($amount)
            ->setType($type)
            ->setSourceBucket($bucket)
            ->setBalanceAfter($balance->getTotalCredits())
            ->setStripePaymentIntentId($stripePaymentIntentId)
            ->setStripeInvoiceId($stripeInvoiceId)
            ->setDescription($description);

        $this->creditTransactionRepository->save($transaction);

        return $transaction;
    }
}
