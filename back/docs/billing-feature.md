# Billing & Credit System

## Overview

The credit system manages user credits with two separate buckets: **subscription credits** (granted by plan renewals) and **topup credits** (purchased separately). A `CreditBalance` entity is the single source of truth, and every mutation is recorded as an immutable `CreditTransaction` for full auditability.

Stripe Checkout handles the payment flow: the backend creates Checkout Sessions and returns URLs for the frontend to redirect users to Stripe-hosted payment pages. Price configuration lives entirely in Stripe product metadata (`plan` and `credit_amount`), with price IDs stored as environment variables.

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
| ScriptGeneration | `script_generation` |
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
| Creator | `creator` |
| Agency | `agency` |

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

#### `addTopupCredits(User $user, int $amount, ?string $stripePaymentIntentId, ?string $stripeInvoiceId): CreditTransaction`
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

## StripeCheckoutService (`Service/Stripe/StripeCheckoutService.php`)

Handles Stripe Checkout Session creation for subscriptions and topup purchases.

### Dependencies

- `string $stripeSecretKey` -- Stripe API key (injected via `services.yaml`)
- `string $stripePriceStarter`, `$stripePriceCreator`, `$stripePriceAgency` -- subscription price IDs
- `string $stripePriceTopup` -- topup price ID
- `string $frontendUrl` -- for building success/cancel redirect URLs
- `EntityManagerInterface`
- `UserRepository`

### Public Methods

#### `getOrCreateStripeCustomer(User $user): string`
Returns the user's Stripe customer ID. If none exists, creates a Stripe customer and persists the ID to the User entity.

#### `createSubscriptionCheckoutSession(User $user, SubscriptionPlan $plan): string`
Creates a Stripe Checkout Session in `subscription` mode. Resolves the price ID from env vars based on the plan. Returns the checkout URL.

#### `createTopupCheckoutSession(User $user): string`
Creates a Stripe Checkout Session in `payment` mode using the single topup price. Returns the checkout URL.

### Checkout Flow

```
Frontend                    Backend                         Stripe
   |                          |                               |
   |-- POST /subscriptions    |                               |
   |   /checkout              |                               |
   |   {"plan":"starter"} --->|                               |
   |                          |-- resolve price from env var   |
   |                          |-- getOrCreateCustomer -------->|
   |                          |<-- customer_id ---------------|
   |                          |-- Session::create ----------->|
   |                          |<-- session {url} -------------|
   |                          |                               |
   |<-- {"checkoutUrl":"..."} |                               |
   |                          |                               |
   |-- redirect to Stripe ---------------------------------->|
   |                          |              Stripe hosted page
   |<-- redirect to /settings?checkout=success --------------|
```

---

## Exceptions

### CreditServiceException (`Service/Credit/Exception/CreditServiceException.php`)
Abstract base exception for the credit domain. Service code: `120200`.

### InsufficientCreditsException (`Service/Credit/Exception/InsufficientCreditsException.php`)
Thrown when a debit is attempted with insufficient credits. Provides `getRequested()` and `getAvailable()` for error reporting.

### StripeServiceException (`Service/Stripe/Exception/StripeServiceException.php`)
Abstract base exception for Stripe operations. Service code: `130100`.

### CheckoutSessionCreationException (`Service/Stripe/Exception/CheckoutSessionCreationException.php`)
Thrown when Stripe Checkout Session creation fails. Wraps Stripe API errors.

---

## API Endpoints

### Subscription Endpoints (`Controller/SubscriptionController.php`)

| Method | Path | Name | Description |
|--------|------|------|-------------|
| POST | `/api/subscriptions/checkout` | `api_subscriptions_checkout` | Create Checkout Session for subscription |
| GET | `/api/subscriptions/current` | `api_subscriptions_current` | Get current subscription |

**POST /api/subscriptions/checkout**
- Request body: `{"plan": "starter"}` (valid values: `starter`, `creator`, `agency`)
- Response: `{"checkoutUrl": "https://checkout.stripe.com/..."}`
- DTO: `CreateSubscriptionCheckoutRequestDTO`

**GET /api/subscriptions/current**
- Response: Subscription entity with `api_subscription_show` group
- Returns 404 if no subscription exists

### Credit Endpoints (`Controller/CreditController.php`)

| Method | Path | Name | Description |
|--------|------|------|-------------|
| POST | `/api/credits/topup/checkout` | `api_credits_topup_checkout` | Create Checkout Session for topup |
| GET | `/api/credits/balance` | `api_credits_balance` | Get credit balance |
| GET | `/api/credits/transactions` | `api_credits_transactions` | Get paginated transaction history |

**POST /api/credits/topup/checkout**
- No request body (single topup price)
- Response: `{"checkoutUrl": "https://checkout.stripe.com/..."}`

**GET /api/credits/balance**
- Response: CreditBalance entity with `api_credit_balance_show` group

**GET /api/credits/transactions**
- Query params: `page` (int), `limit` (int)
- Response: Paginated CreditTransaction list with `api_credit_transactions_list` group
- DTO: `ListCreditTransactionsQueryParamDTO`

---

## DTOs

### Request DTOs

#### CreateSubscriptionCheckoutRequestDTO (`DTO/Request/Subscription/`)
- Extends `AbstractRequestDTO`
- Property: `plan` (string, NotBlank)
- `getPlan(): SubscriptionPlan` -- converts string to enum

### QueryParam DTOs

#### ListCreditTransactionsQueryParamDTO (`DTO/QueryParam/Credit/`)
- Extends `AbstractQueryParamDTO`
- Properties: `page` (int), `limit` (int)

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

### UserRepository (additions)
- `getByStripeCustomerId(string $stripeCustomerId): ?User`

---

## User Entity

OneToOne relationships (inverse side, mapped by User, cascade remove):
- `creditBalance` -- `?CreditBalance`
- `subscription` -- `?Subscription`

Stripe field:
- `stripeCustomerId` -- `?string`, nullable, serialized in `api_user_me` group

---

## Environment Variables

| Variable | Description | Location |
|----------|-------------|----------|
| `STRIPE_SECRET_KEY` | Stripe API secret key | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |
| `STRIPE_PRICE_STARTER` | Stripe price ID for Starter plan | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |
| `STRIPE_PRICE_CREATOR` | Stripe price ID for Creator plan | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |
| `STRIPE_PRICE_AGENCY` | Stripe price ID for Agency plan | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |
| `STRIPE_PRICE_TOPUP` | Stripe price ID for topup pack | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |

Price IDs are resolved at runtime via `services.yaml` parameters injected into `StripeCheckoutService`.

---

## Business Rules

1. **Single source of truth**: `CreditBalance` is the only place to check available credits
2. **Audit trail**: Every balance mutation creates a `CreditTransaction` -- no exceptions
3. **Debit order**: Subscription credits consumed first, then topup credits
4. **Hard block**: Debits are rejected if insufficient credits (no negative balances)
5. **Race condition safety**: Pessimistic locking prevents concurrent debits from over-spending
6. **Webhook idempotency**: `StripeWebhookEvent.stripeEventId` unique constraint prevents duplicate processing
7. **Metadata-driven pricing**: Plan name and credit amounts live in Stripe product metadata, not in app config
8. **Stripe customer linkage**: `stripeCustomerId` on User entity (not Subscription) -- one customer per user across all Stripe interactions
