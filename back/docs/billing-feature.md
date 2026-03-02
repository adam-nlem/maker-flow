# Billing & Credit System

## Overview

The credit system manages user credits with two separate buckets: **subscription credits** (granted by plan renewals) and **topup credits** (purchased separately). A `CreditBalance` entity is the single source of truth, and every mutation is recorded as an immutable `CreditTransaction` for full auditability.

---

## Entities

### CreditBalance

Single source of truth for a user's available credits. OneToOne with User.

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Auto-increment PK |
| `uuid` | GUID | Public identifier |
| `subscriptionCredits` | int | Credits from subscription renewals |
| `topupCredits` | int | Credits from topup purchases |
| `user` | OneToOne(User) | Owner (owning side, CASCADE delete) |
| `createdAt` | DateTimeImmutable | UTC timestamp |
| `updatedAt` | DateTimeImmutable | UTC timestamp, auto-updated |

Key method: `getTotalCredits(): int` returns `subscriptionCredits + topupCredits`.

Serialization groups: `api_credit_balance_show`

### CreditTransaction

Immutable audit log. Every credit change produces a row here.

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Auto-increment PK |
| `uuid` | GUID | Public identifier |
| `amount` | int | Positive = credit, negative = debit |
| `type` | CreditTransactionType | Transaction category |
| `sourceBucket` | SourceBucket | Which bucket was affected |
| `balanceAfter` | int | Total credits after this transaction |
| `stripePaymentIntentId` | ?string | Stripe PI reference |
| `stripeInvoiceId` | ?string | Stripe invoice reference |
| `description` | ?text | Human-readable audit note |
| `user` | ManyToOne(User) | Owner |
| `creditBalance` | ManyToOne(CreditBalance) | Parent balance |
| `createdAt` | DateTimeImmutable | UTC timestamp |

No `updatedAt` -- transactions are immutable.

Serialization groups: `api_credit_transactions_list`

### Subscription

Local mirror of Stripe subscription state. OneToOne with User.

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Auto-increment PK |
| `uuid` | GUID | Public identifier |
| `stripeSubscriptionId` | string | Unique Stripe subscription ID |
| `stripeCustomerId` | string | Stripe customer ID |
| `plan` | SubscriptionPlan | Current plan |
| `status` | SubscriptionStatus | Current status |
| `currentPeriodStart` | DateTimeImmutable | Billing period start |
| `currentPeriodEnd` | DateTimeImmutable | Billing period end |
| `cancelAtPeriodEnd` | bool | Whether cancellation is scheduled |
| `user` | OneToOne(User) | Owner (owning side, CASCADE delete) |
| `createdAt` | DateTimeImmutable | UTC timestamp |
| `updatedAt` | DateTimeImmutable | UTC timestamp, auto-updated |

Key method: `isActive(): bool` returns `status === Active`.

Serialization groups: `api_subscription_show`

### StripeWebhookEvent

Idempotency tracking for Stripe webhooks.

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Auto-increment PK |
| `stripeEventId` | string | Unique Stripe event ID |
| `eventType` | StripeEventType | Event type enum |
| `processedAt` | DateTimeImmutable | When the event was processed |
| `payload` | JSON | Full event payload |
| `createdAt` | DateTimeImmutable | UTC timestamp |

No UUID (stripeEventId serves as public identifier). No serialization groups (not exposed via API).

---

## Enums

### CreditTransactionType (`Entity/Enum/CreditTransactionType.php`)

| Case | Value |
|------|-------|
| SubscriptionRenewal | `subscription_renewal` |
| TopupPurchase | `topup_purchase` |
| CreditUsage | `credit_usage` |
| Refund | `refund` |
| ManualAdjustment | `manual_adjustment` |

### SourceBucket (`Entity/Enum/SourceBucket.php`)

| Case | Value |
|------|-------|
| SubscriptionCredits | `subscription_credits` |
| TopupCredits | `topup_credits` |

### SubscriptionPlan (`Entity/Enum/SubscriptionPlan.php`)

| Case | Value |
|------|-------|
| Free | `free` |
| Starter | `starter` |
| Pro | `pro` |
| Business | `business` |

### SubscriptionStatus (`Entity/Enum/SubscriptionStatus.php`)

| Case | Value |
|------|-------|
| Active | `active` |
| PastDue | `past_due` |
| Canceled | `canceled` |
| Incomplete | `incomplete` |
| Trialing | `trialing` |
| Unpaid | `unpaid` |

### StripeEventType (`Entity/Enum/StripeEventType.php`)

| Case | Value |
|------|-------|
| InvoicePaid | `invoice.paid` |
| InvoicePaymentFailed | `invoice.payment_failed` |
| CustomerSubscriptionCreated | `customer.subscription.created` |
| CustomerSubscriptionUpdated | `customer.subscription.updated` |
| CustomerSubscriptionDeleted | `customer.subscription.deleted` |
| CheckoutSessionCompleted | `checkout.session.completed` |

---

## CreditService (`Service/Credit/CreditService.php`)

Core business logic for credit operations. Uses pessimistic locking and DB transactions for production-grade safety.

### Dependencies

- `EntityManagerInterface` -- for DB transactions
- `CreditBalanceRepository` -- balance read/write (with lock support)
- `CreditTransactionRepository` -- transaction persistence

### Public Methods

#### `getOrCreateBalance(User $user): CreditBalance`
Lazily creates a zero-balance if the user doesn't have one yet.

#### `addTopupCredits(User $user, int $amount, CreditTransactionType $type, ?string $stripePaymentIntentId, ?string $stripeInvoiceId): CreditTransaction`
Adds credits to the topup bucket. Wrapped in a DB transaction for atomicity (balance update + transaction insert).

#### `renewSubscriptionCredits(User $user, int $planCredits, ?string $stripeInvoiceId): CreditTransaction`
Resets `subscriptionCredits` to the plan amount (not additive). Calculates the delta (`planCredits - currentSubscriptionCredits`) and records a CreditTransaction with `type = SubscriptionRenewal`. Called at each subscription renewal.

#### `debitCredits(User $user, int $amount, CreditTransactionType $type): CreditTransaction[]`
Debits credits following the **subscription-first** rule:
1. Acquires a `PESSIMISTIC_WRITE` lock on the CreditBalance row
2. Validates sufficient credits, throws `InsufficientCreditsException` if not
3. Deducts from `subscriptionCredits` first, then `topupCredits`
4. Creates 1-2 CreditTransaction records (one per bucket used)
5. Each transaction's `balanceAfter` reflects the running total after that specific debit

#### `getTotalCredits(User $user): int`
Returns the sum of subscription + topup credits.

### Debit Transaction Flow

```
1. BEGIN TRANSACTION
2. SELECT ... FROM credit_balance WHERE user_id = ? FOR UPDATE
3. Validate: totalCredits >= amount (else ROLLBACK + throw)
4. fromSubscription = min(subscriptionCredits, amount)
   fromTopup = amount - fromSubscription
5. Update balance buckets
6. INSERT CreditTransaction(s) per non-zero bucket
7. FLUSH + COMMIT (releases lock)
```

---

## Exceptions

### CreditServiceException (`Service/Credit/Exception/CreditServiceException.php`)
Abstract base exception for the credit domain. Service code: `120200`.

### InsufficientCreditsException (`Service/Credit/Exception/InsufficientCreditsException.php`)
Thrown when a debit is attempted with insufficient credits. Provides `getRequested()` and `getAvailable()` for error reporting.

---

## Repositories

### CreditBalanceRepository
- `getByUser(User $user): ?CreditBalance` -- standard lookup
- `getByUserWithLock(User $user): ?CreditBalance` -- with `PESSIMISTIC_WRITE` lock (must be called within a DB transaction)

### CreditTransactionRepository
- `getByUserPaginated(User $user, int $page, int $limit): array` -- paginated transaction history

### SubscriptionRepository
- `getByUser(User $user): ?Subscription`
- `getByStripeSubscriptionId(string $stripeSubscriptionId): ?Subscription`

### StripeWebhookEventRepository
- `existsByStripeEventId(string $stripeEventId): bool` -- idempotency check

---

## User Entity Changes

Two new OneToOne relationships added (inverse side, mapped by User):
- `creditBalance` -- `?CreditBalance`, cascade remove
- `subscription` -- `?Subscription`, cascade remove

---

## Business Rules

1. **Single source of truth**: `CreditBalance` is the only place to check available credits
2. **Audit trail**: Every balance mutation creates a `CreditTransaction` -- no exceptions
3. **Debit order**: Subscription credits consumed first, then topup credits
4. **Hard block**: Debits are rejected if insufficient credits (no negative balances)
5. **Race condition safety**: Pessimistic locking prevents concurrent debits from over-spending
6. **Webhook idempotency**: `StripeWebhookEvent.stripeEventId` unique constraint prevents duplicate processing
