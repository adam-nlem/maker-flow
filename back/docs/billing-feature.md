# Billing & Credit System

## Overview

The credit system manages user credits with two separate buckets: **subscription credits** (granted by plan renewals) and **refill credits** (purchased separately). A `CreditBalance` entity is the single source of truth, and every mutation is recorded as an immutable `CreditTransaction` for full auditability.

Stripe Checkout handles the payment flow: the backend creates Checkout Sessions and returns URLs for the frontend to redirect users to Stripe-hosted payment pages. Plan identification is driven by **Stripe Product metadata** (`product.metadata.plan`), making the system fully metadata-driven — adding or modifying plans only requires changes in the Stripe dashboard.

---

## Entities

### CreditBalance

Single source of truth for a user's available credits. OneToOne with User.

| Field | Type | Description |
|-------|------|-------------|
| `id` | int | Auto-increment PK |
| `uuid` | GUID | Public identifier |
| `subscriptionCredits` | int | Credits from subscription renewals |
| `refillCredits` | int | Credits from refill purchases |
| `user` | OneToOne(User) | Owner (owning side, CASCADE delete) |
| `createdAt` | DateTimeImmutable | UTC timestamp |
| `updatedAt` | DateTimeImmutable | UTC timestamp, auto-updated |

Key method: `getTotalCredits(): int` returns `subscriptionCredits + refillCredits`.

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
| RefillPurchase | `refill_purchase` |
| ScriptGeneration | `script_generation` |
| Refund | `refund` |
| ManualAdjustment | `manual_adjustment` |

### SourceBucket (`Entity/Enum/SourceBucket.php`)

| Case | Value |
|------|-------|
| SubscriptionCredits | `subscription_credits` |
| RefillCredits | `refill_credits` |

### SubscriptionPlan (`Entity/Enum/SubscriptionPlan.php`)

| Case | Value |
|------|-------|
| Starter | `starter` |
| Creator | `creator` |
| Agency | `agency` |

> **Note:** There is no `Free` case. A "free user" is simply a user with no active subscription.

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

#### `addRefillCredits(User $user, int $amount, ?string $stripePaymentIntentId, ?string $stripeInvoiceId): CreditTransaction`
Adds credits to the refill bucket. Wrapped in a DB transaction for atomicity (balance update + transaction insert).

#### `renewSubscriptionCredits(User $user, int $planCredits, ?string $stripeInvoiceId): CreditTransaction`
Resets `subscriptionCredits` to the plan amount (not additive). Calculates the delta (`planCredits - currentSubscriptionCredits`) and records a CreditTransaction with `type = SubscriptionRenewal`. Called at each subscription renewal.

#### `debitCredits(User $user, int $amount, CreditTransactionType $type): CreditTransaction[]`
Debits credits following the **subscription-first** rule:
1. Acquires a `PESSIMISTIC_WRITE` lock on the CreditBalance row
2. Validates sufficient credits, throws `InsufficientCreditsException` if not
3. Deducts from `subscriptionCredits` first, then `refillCredits`
4. Creates 1-2 CreditTransaction records (one per bucket used)
5. Each transaction's `balanceAfter` reflects the running total after that specific debit

#### `getTotalCredits(User $user): int`
Returns the sum of subscription + refill credits.

### Debit Transaction Flow

```
1. BEGIN TRANSACTION
2. SELECT ... FROM credit_balance WHERE user_id = ? FOR UPDATE
3. Validate: totalCredits >= amount (else ROLLBACK + throw)
4. fromSubscription = min(subscriptionCredits, amount)
   fromRefill = amount - fromSubscription
5. Update balance buckets
6. INSERT CreditTransaction(s) per non-zero bucket
7. FLUSH + COMMIT (releases lock)
```

---

## StripePlanService (`Service/Stripe/StripePlanService.php`)

Central service for plan configuration. Fetches plan data from Stripe product/price metadata, caches it in Redis, and provides lookup methods used by all other Stripe services.

### Dependencies

- `string $stripeSecretKey` -- Stripe API key
- `RedisStoreService` -- Redis cache
- `LoggerInterface` -- for logging warnings on missing metadata

### Public Methods

#### `getPlanConfigs(): PlanConfigResponseDTO[]`
Returns all plan configurations as DTOs. Checks Redis cache first (key: `STRIPE/PLANS`, TTL: 1 hour). If cache miss, fetches from Stripe and caches.

#### `getPlanConfigFromSubscription(SubscriptionPlan $plan): ?PlanConfigResponseDTO`
Returns a single plan's configuration DTO from the cached plans.

#### `getPriceIdForPlan(SubscriptionPlan $plan): ?string`
Returns the Stripe price ID for a given plan. Used by `StripeCheckoutService` to create checkout sessions.

#### `resolvePlanFromPriceId(string $priceId): ?SubscriptionPlan`
Returns the `SubscriptionPlan` enum for a given Stripe price ID. Used by `StripeWebhookService` to identify plans from webhooks.

#### `refreshCache(): PlanConfigResponseDTO[]`
Force-fetches plans from Stripe, updates the Redis cache, and returns the plans as DTOs.

### How Plan Identification Works

All Stripe Products are identified by their `product.metadata.type` field, using the `StripeProductType` enum (`Entity/Enum/StripeProductType.php`):
- `subscription` — subscription plan products (handled by `StripePlanService`)
- `refill` — refill product (handled by `StripeRefillService`)

`StripePlanService` fetches all active Stripe Products, filters by `type=subscription`, then validates the `plan` metadata against the `SubscriptionPlan` enum. The associated default price is retrieved for pricing and credit data.

This metadata-driven approach means:
- **No hardcoded price IDs** anywhere — all products are identified via metadata
- **Adding a new plan** only requires creating a Stripe Product with the right metadata — no code or env var changes needed

### Stripe Product Metadata (Subscription)

Each subscription product must have these metadata fields:

| Key | Type | Description |
|-----|------|-------------|
| `type` | string | Must be `"subscription"` |
| `plan` | string | Plan identifier (`starter`, `creator`, `agency`) — must match a `SubscriptionPlan` enum case |
| `is_highlighted` | string | `"true"` or `"false"` -- marks the recommended plan |
| `max_projects` | string | Number or `"null"` for unlimited |
| `max_scripts_per_project` | string | Number or `"null"` for unlimited |
| `sort_order` | string | Display ordering number |

Feature labels are configured via Stripe's built-in **Marketing features** on each Product (not metadata).

### Stripe Product Metadata (Refill)

The refill product must have:

| Key | Type | Description |
|-----|------|-------------|
| `type` | string | Must be `"refill"` |

### Stripe Price Metadata

Each Stripe price (default price of the product) must have:

| Key | Type | Description |
|-----|------|-------------|
| `credit_amount` | string | Number of credits granted per billing cycle |

### CLI Command

```bash
dce back php bin/console app:stripe:refresh-plans
```

Manually refreshes both the plans and refill Redis caches from Stripe. Use after updating product metadata in the Stripe dashboard.

### Response DTOs

- `PlanConfigResponseDTO` -- Single plan's display data (implements `ResponseDTOInterface`)
- `ListPlansResponseDTO` -- Wraps array of `PlanConfigResponseDTO`

---

## StripeRefillService (`Service/Stripe/StripeRefillService.php`)

Fetches the refill product from Stripe by `product.metadata.type=refill` and caches the price ID in Redis.

### Dependencies

- `string $stripeSecretKey` -- Stripe API key
- `RedisStoreService` -- Redis cache (key: `STRIPE/REFILL`, TTL: 1 hour)

### Public Methods

#### `getRefillPriceId(): ?string`
Returns the cached refill price ID. If cache miss, fetches from Stripe.

#### `refreshCache(): ?string`
Force-fetches the refill price ID from Stripe and updates the Redis cache.

---

## StripeCheckoutService (`Service/Stripe/StripeCheckoutService.php`)

Handles Stripe Checkout Session creation for subscriptions and refill purchases.

### Dependencies

- `string $stripeSecretKey` -- Stripe API key (injected via `services.yaml`)
- `string $frontendUrl` -- for building success/cancel redirect URLs
- `UserRepository`
- `StripePlanService` -- for resolving plan price IDs
- `StripeRefillService` -- for resolving refill price ID

### Public Methods

#### `getOrCreateStripeCustomer(User $user): string`
Returns the user's Stripe customer ID. If none exists, creates a Stripe customer and persists the ID to the User entity.

#### `createSubscriptionCheckoutSession(User $user, SubscriptionPlan $plan, string $checkoutRedirectPath = '/settings/subscription'): string`
Creates a Stripe Checkout Session in `subscription` mode. Resolves the price ID via `StripePlanService::getPriceIdForPlan()`. Returns the checkout URL. `$checkoutRedirectPath` is the base path for both success and cancel redirects — the backend appends `?checkout=success` or `?checkout=cancel` automatically. Defaults to `/settings/subscription`.

#### `createRefillCheckoutSession(User $user): string`
Creates a Stripe Checkout Session in `payment` mode using the single refill price. Returns the checkout URL.

### Checkout Flow

```
Frontend                    Backend                         Stripe
   |                          |                               |
   |-- POST /subscriptions    |                               |
   |   /checkout              |                               |
   |   {"plan":"starter"} --->|                               |
   |                          |-- StripePlanService            |
   |                          |   ->getPriceIdForPlan()        |
   |                          |-- getOrCreateCustomer -------->|
   |                          |<-- customer_id ---------------|
   |                          |-- Session::create ----------->|
   |                          |<-- session {url} -------------|
   |                          |                               |
   |<-- {"checkout_url":"..."}|                               |
   |                          |                               |
   |-- redirect to Stripe ---------------------------------->|
   |                          |              Stripe hosted page
   |<-- redirect to /settings/subscription?checkout=success -|
```

---

## StripeSubscriptionService (`Service/Stripe/StripeSubscriptionService.php`)

Handles subscription lifecycle management via the Stripe API: cancel and resume.

### Dependencies

- `string $stripeSecretKey` -- Stripe API key
- `SubscriptionRepository`
- `LoggerInterface`

### Public Methods

#### `cancelSubscription(Subscription $subscription): void`
Sets `cancel_at_period_end = true` on the Stripe subscription and updates the local entity. The subscription remains active until the end of the current billing period.

#### `resumeSubscription(Subscription $subscription): void`
Removes the scheduled cancellation by setting `cancel_at_period_end = false`. Throws `SubscriptionManagementException` if not currently scheduled for cancellation.

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

### WebhookSignatureVerificationException (`Service/Stripe/Exception/WebhookSignatureVerificationException.php`)
Thrown when Stripe webhook signature verification fails.

### SubscriptionManagementException (`Service/Stripe/Exception/SubscriptionManagementException.php`)
Thrown when a subscription management action fails (cancel, resume, or plan change). Wraps Stripe API errors.

---

## API Endpoints

### Subscription Endpoints (`Controller/SubscriptionController.php`)

| Method | Path | Name | Description |
|--------|------|------|-------------|
| GET | `/api/subscriptions/plans` | `api_subscriptions_plans` | Get all plan configurations from Stripe |
| POST | `/api/subscriptions/checkout` | `api_subscriptions_checkout` | Create Checkout Session for subscription |
| GET | `/api/subscriptions/current` | `api_subscriptions_current` | Get current subscription |
| POST | `/api/subscriptions/cancel` | `api_subscriptions_cancel` | Cancel subscription at period end |
| POST | `/api/subscriptions/resume` | `api_subscriptions_resume` | Resume a canceled subscription |

**GET /api/subscriptions/plans**
- No request body
- Response: Array of plan config objects (plan, name, monthlyPrice, currency, creditsPerMonth, maxProjects, maxScriptsPerProject, features, isHighlighted, sortOrder)
- Data fetched from Stripe product/price metadata, cached in Redis (1 hour TTL)
- DTO: `ListPlansResponseDTO` containing `PlanConfigResponseDTO[]`

**POST /api/subscriptions/checkout**
- Request body: `{"plan": "starter"}` (valid values: `starter`, `creator`, `agency`)
- Response: `{"checkoutUrl": "https://checkout.stripe.com/..."}`
- DTO: `CreateSubscriptionCheckoutRequestDTO`

**GET /api/subscriptions/current**
- Response: Subscription entity with `api_subscription_show` group
- Returns 200 with `null` body if no active subscription exists

**POST /api/subscriptions/cancel**
- No request body
- Response: Updated Subscription entity with `api_subscription_show` group
- Sets `cancel_at_period_end = true` (subscription stays active until period end)
- Returns 404 if no subscription, 400 on Stripe error

**POST /api/subscriptions/resume**
- No request body
- Response: Updated Subscription entity with `api_subscription_show` group
- Sets `cancel_at_period_end = false` (undoes scheduled cancellation)
- Returns 404 if no subscription, 400 if not scheduled for cancellation

### Credit Endpoints (`Controller/CreditController.php`)

| Method | Path | Name | Description |
|--------|------|------|-------------|
| POST | `/api/credits/refill/checkout` | `api_credits_refill_checkout` | Create Checkout Session for refill |
| GET | `/api/credits/balance` | `api_credits_balance` | Get credit balance |
| GET | `/api/credits/transactions` | `api_credits_transactions` | Get paginated transaction history |

**POST /api/credits/refill/checkout**
- No request body (single refill price)
- Response: `{"checkoutUrl": "https://checkout.stripe.com/..."}`

**GET /api/credits/balance**
- Response: CreditBalance entity with `api_credit_balance_show` group

**GET /api/credits/transactions**
- Query params: `page` (int), `limit` (int)
- Response: Paginated CreditTransaction list with `api_credit_transactions_list` group
- DTO: `ListCreditTransactionsQueryParamDTO`

### Stripe Webhook Endpoint (`Controller/StripeWebhookController.php`)

| Method | Path | Name | Description |
|--------|------|------|-------------|
| POST | `/api/stripe/webhook` | `api_stripe_webhook` | Receive Stripe webhook events |

**POST /api/stripe/webhook**
- Public access (no auth required, secured by Stripe signature verification)
- Request body: Raw Stripe event payload
- Header: `Stripe-Signature` (required)
- Response: `{"message": "Webhook received"}` (200)
- Unsupported event types and duplicates return 200 silently
- Invalid signature returns 400

---

## DTOs

### Request DTOs

#### CreateSubscriptionCheckoutRequestDTO (`DTO/Request/Subscription/`)
- Extends `AbstractRequestDTO`
- Property: `plan` (string, NotBlank)
- Property: `checkoutRedirectPath` (string, optional) -- base path for Stripe success/cancel redirects. Defaults to `/settings/subscription`.
- `getPlan(): SubscriptionPlan` -- converts string to enum
- `getCheckoutRedirectPath(): string` -- returns the base redirect path

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
- `getActiveByUser(User $user): ?Subscription` -- returns only if status is `Active` AND `currentPeriodEnd >= now`
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
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | `.env`, `docker-compose.yaml`, `back/.env`, `services.yaml` |

> **Note:** All `STRIPE_PRICE_*` env vars have been removed. Product identification is fully metadata-driven via `StripePlanService` and `StripeRefillService`, using the `StripeProductType` enum and `product.metadata.type`.

---

## Plan-Based Feature Limits

Plan limits (maxProjects, maxScriptsPerProject) are stored in Stripe product metadata and cached by `StripePlanService`. When no active subscription exists, the user is treated as a free user with default limits.

### Subscription Resolution

Controllers use `SubscriptionRepository::getActiveByUser($user)` to get the subscription. This method validates both status (`Active`) and expiry (`currentPeriodEnd >= now`). If it returns `null`, the user is treated as free.

### Plan Limits (from Stripe metadata)

Limits are configured in Stripe product metadata and read via `StripePlanService`. The `SubscriptionPlan` enum is a type-safe identifier only — it no longer contains limit methods.

**Free user defaults** (no active subscription): max 1 project, max 1 script per project.

### Limit Enforcement Pattern

Limits are checked in controllers before calling services using `StripePlanService`:

```php
$plan = $subscriptionRepository->getActiveByUser($user)?->getPlan();
$maxX = $plan !== null ? $stripePlanService->getPlanConfig($plan)?->getMaxX() : 1;

if ($maxX !== null && $repository->countBy...($user) >= $maxX) {
    return $this->json(
        data: ["message" => "You have reached the X limit for your plan."],
        status: Response::HTTP_PAYMENT_REQUIRED // 402
    );
}
```

### Feature Restrictions for Free Users

Premium detail endpoints return **402 Payment Required** directly from controllers. No data is served to free users — the check happens before calling the service.

| Endpoint | Controller | Behavior |
|----------|-----------|----------|
| `GET /api/post-insights/detail` | `PostInsightController::detail()` | Returns 402 if `getActiveByUser()` is null |
| `GET /api/integration-insights/detail` | `IntegrationInsightController::detail()` | Returns 402 if `getActiveByUser()` is null |

Services that receive an `isSubscribed` parameter skip premium computations for free users:

| Service Method | Behavior |
|---------------|----------|
| `PostInsightService::getDetail()` | Always computes full detail (previous post, timelines, ranking, engagement) |
| `IntegrationInsightService::getDetail()` | Always computes full detail (previous period, evolution percentages) |
| `IntegrationInsightService::list()` | Receives `isSubscribed` param — skips aggregation for free users (returns empty `aggregatedInsights`) |
| `PostService::getPostsWithInsights()` | Receives `isSubscribed` param — post list is accessible to free users with null evolution data |

### Current Limits

| Feature | Where checked | Trigger |
|---------|--------------|---------|
| Project creation | `ProjectController::create()` | Before entity creation |
| Script creation | `ScriptController::create()` | Before entity creation |
| Script generation | `ScriptGenerationController::create()` | Before message dispatch |
| Post detail insights | `PostInsightController::detail()` | 402 from controller if not subscribed |
| Integration detail insights | `IntegrationInsightController::detail()` | 402 from controller if not subscribed |
| Aggregated insights | `IntegrationInsightService::list()` | `isSubscribed` param — empty `aggregatedInsights` for free users |
| Ranked post groups | `PostGroupController::rank()` | 402 from controller if not subscribed |
| Evolution percentages (post list) | `PostService::getPostsWithInsights()` | `isSubscribed` param from controller |

---

## Business Rules

1. **Single source of truth**: `CreditBalance` is the only place to check available credits
2. **Audit trail**: Every balance mutation creates a `CreditTransaction` -- no exceptions
3. **Debit order**: Subscription credits consumed first, then refill credits
4. **Hard block**: Debits are rejected if insufficient credits (no negative balances)
5. **Race condition safety**: Pessimistic locking prevents concurrent debits from over-spending
6. **Webhook idempotency**: `StripeWebhookEvent.stripeEventId` unique constraint prevents duplicate processing
7. **Metadata-driven plans**: Plan identity, features, and limits live in Stripe product metadata — no hardcoded price IDs for plan resolution
8. **Stripe customer linkage**: `stripeCustomerId` on User entity (not Subscription) -- one customer per user across all Stripe interactions

---

## Stripe Webhook System

### Architecture

```
Stripe  ──POST──▶  StripeWebhookController (synchronous, fast)
                      │
                      ├─ Verify signature (STRIPE_WEBHOOK_SECRET)
                      ├─ Check event type is supported (StripeEventType::tryFrom)
                      ├─ Check idempotency (existsByStripeEventId)
                      ├─ Save StripeWebhookEvent to DB
                      ├─ Dispatch ProcessStripeWebhookMessage to RabbitMQ
                      └─ Return 200

Worker  ◀─consume──  ProcessStripeWebhookHandler (async)
                      │
                      ├─ Load StripeWebhookEvent by ID
                      └─ Call StripeWebhookService::processEvent()
```

### StripeWebhookService (`Service/Stripe/StripeWebhookService.php`)

Handles signature verification and event processing. Uses `StripePlanService` for plan resolution from price IDs.

#### `constructEvent(string $payload, string $signature): \Stripe\Event`
Verifies the webhook signature and constructs the Stripe event. Throws `WebhookSignatureVerificationException` on failure.

#### `processEvent(StripeWebhookEvent $event): void`
Processes the event based on its type:

| Event Type | Action |
|------------|--------|
| `checkout.session.completed` (payment mode) | Fetch session line items via Stripe API, read `credit_amount` from price metadata, call `CreditService::addRefillCredits()` |
| `customer.subscription.created` | Resolve plan via `StripePlanService::resolvePlanFromPriceId()`, create local `Subscription` entity |
| `customer.subscription.updated` | Update subscription status, period dates, cancelAtPeriodEnd, plan |
| `customer.subscription.deleted` | Set subscription status to `Canceled` |
| `invoice.paid` | Read `credit_amount` from invoice line item price metadata, call `CreditService::renewSubscriptionCredits()` |
| `invoice.payment_failed` | Set subscription status to `PastDue` |

### Async Processing

| File | Description |
|------|-------------|
| `Message/ProcessStripeWebhookMessage.php` | Carries `webhookEventId`, routed to `messages` transport via `#[AsMessage('messages')]` |
| `Message/Handler/ProcessStripeWebhookHandler.php` | Loads event from DB, calls `StripeWebhookService::processEvent()`, logs errors, re-throws for transport retry |

Transport-level retry: 3 retries with exponential backoff (1s, 2s, 4s) configured in `messenger.yaml`.

### Stripe Price Metadata Requirement

Each Stripe price must have a `credit_amount` metadata field set in the Stripe dashboard:
- Starter price → `credit_amount: 50`
- Creator price → `credit_amount: 150`
- Agency price → `credit_amount: 500`
- Refill price → `credit_amount: <desired amount>`

### Configuration

Security (`config/packages/security.yaml`):
```yaml
- { path: ^/api/stripe/webhook, roles: PUBLIC_ACCESS }
```

Services (`config/services.yaml`):
```yaml
App\Service\Stripe\StripeWebhookService:
    arguments:
        $stripeSecretKey: "%app.stripe.secret_key%"
        $stripeWebhookSecret: "%app.stripe.webhook_secret%"
```

### Local Testing

```bash
# Install Stripe CLI and listen for webhooks
stripe listen --forward-to localhost:80/api/stripe/webhook

# Copy the signing secret from Stripe CLI output to .env
STRIPE_WEBHOOK_SECRET=whsec_...

# Start the messenger worker
dce back php bin/console messenger:consume async -vv
```
