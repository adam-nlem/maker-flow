# Billing Feature - Frontend

## Overview

The billing frontend displays credit balances, current subscription information, and a plan selector for subscribing via Stripe Checkout. It lives under the `/settings/subscription` route.

---

## Settings Sub-routing

The settings page uses React Router 7 nested routes with a dynamic `:section` parameter.

### Route Configuration (`routes.ts`)

```ts
route("settings", "routes/settings.tsx", [
    index("routes/settings.index.tsx"),          // /settings -> redirect to /settings/general
    route(":section", "routes/settings.section.tsx"), // /settings/:section
]),
```

### Key Files

| File | Purpose |
|------|---------|
| `routes/settings.tsx` | Layout: renders `SideBar` + `SettingsPageView` |
| `routes/settings.index.tsx` | Redirects `/settings` to `/settings/general` |
| `routes/settings.section.tsx` | Maps `:section` param to the correct component |
| `components/settings/SettingsPageView.tsx` | Settings sidebar (SidePanel) + `<Outlet />` |

### Adding a New Settings Section

1. Add enum value in `models/enums/SettingsSection.ts`
2. Add path in `settingsSectionToPath` record
3. Add translation in `settingsSectionToFrenchTranslation` record
4. Add icon in `settingsSectionToIcon` record
5. Add component entry in `sectionComponents` map in `routes/settings.section.tsx`

---

## Enums

### SubscriptionPlan (`models/enums/SubscriptionPlan.ts`)

| Case | Value |
|------|-------|
| Free | `free` |
| Starter | `starter` |
| Creator | `creator` |
| Agency | `agency` |

Exports: `subscriptionPlanOptions`, `subscriptionPlanToFrenchTranslation`

### SubscriptionStatus (`models/enums/SubscriptionStatus.ts`)

| Case | Value |
|------|-------|
| Active | `active` |
| PastDue | `past_due` |
| Canceled | `canceled` |
| Incomplete | `incomplete` |
| Trialing | `trialing` |
| Unpaid | `unpaid` |

Exports: `subscriptionStatusOptions`, `subscriptionStatusToFrenchTranslation`

### CreditTransactionType (`models/enums/CreditTransactionType.ts`)

| Case | Value |
|------|-------|
| SubscriptionRenewal | `subscription_renewal` |
| TopupPurchase | `topup_purchase` |
| ScriptGeneration | `script_generation` |
| Refund | `refund` |
| ManualAdjustment | `manual_adjustment` |

Exports: `creditTransactionTypeOptions`, `creditTransactionTypeToFrenchTranslation`

### SourceBucket (`models/enums/SourceBucket.ts`)

| Case | Value |
|------|-------|
| SubscriptionCredits | `subscription_credits` |
| TopupCredits | `topup_credits` |

Exports: `sourceBucketOptions`, `sourceBucketToFrenchTranslation`

---

## Models

### CreditBalance (`models/CreditBalance.ts`)

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | string | Public identifier |
| `subscriptionCredits` | number | Credits from subscription renewals |
| `topupCredits` | number | Credits from topup purchases |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date \| null | Last update timestamp |

Computed getter: `totalCredits` returns `subscriptionCredits + topupCredits`.

### Subscription (`models/Subscription.ts`)

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | string | Public identifier |
| `stripeSubscriptionId` | string | Stripe subscription ID |
| `plan` | SubscriptionPlan | Current plan |
| `status` | SubscriptionStatus | Current status |
| `currentPeriodStart` | Date | Billing period start |
| `currentPeriodEnd` | Date | Billing period end |
| `cancelAtPeriodEnd` | boolean | Cancellation scheduled |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date \| null | Last update timestamp |

Computed getter: `isActive` returns `status === Active`.

---

## Plan Config (`models/PlanConfig.ts`)

Interface + constant array for plan display data. All prices and features are configured here for easy updates.

```ts
export interface PlanConfig {
    plan: SubscriptionPlan;
    name: string;
    monthlyPrice: number;       // in euros
    creditsPerMonth: number;
    features: string[];
    isHighlighted: boolean;
}

export const planConfigs: PlanConfig[];
```

---

## API Hooks

### Query Keys

| File | Keys |
|------|------|
| `hooks/api/credits/creditQueryKeys.ts` | `all`, `balance()`, `transactions(page, limit)` |
| `hooks/api/subscriptions/subscriptionQueryKeys.ts` | `all`, `current()` |

### Hooks

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useShowCreditBalance` | `GET /api/credits/balance` | `{ creditBalance, isLoading, error }` |
| `useShowCurrentSubscription` | `GET /api/subscriptions/current` | `{ subscription, isLoading, error }` (null if no subscription) |
| `useCreateSubscriptionCheckout` | `POST /api/subscriptions/checkout` | `{ createCheckout, isPending, error }` (redirects to Stripe on success) |
| `useCancelSubscription` | `POST /api/subscriptions/cancel` | `{ cancelSubscription, isPending, error }` (invalidates subscription query) |
| `useResumeSubscription` | `POST /api/subscriptions/resume` | `{ resumeSubscription, isPending, error }` (invalidates subscription query) |
| `useCreateTopupCheckout` | `POST /api/credits/topup/checkout` | `{ createTopupCheckout, isPending, error }` (redirects to Stripe on success) |
| `useListCreditTransactions` | `GET /api/credits/transactions` | `{ transactions, isLoading, error }` (paginated) |

---

## Components

### SubscriptionSettings (`components/settings/SubscriptionSettings.tsx`)

Main orchestrator for the subscription page. Displays:
1. Credit balance card with topup button (always)
2. Current subscription card with management actions (if subscribed) OR Plan selector (if not)
3. Credit transaction history (always, hidden if no transactions)

Handles `?checkout=success` query param to show a success toast after Stripe redirect.

### CreditBalanceCard (`components/settings/subscription/CreditBalanceCard.tsx`)

Displays total credits with subscription/topup breakdown and a "Recharger" topup button. Shows shimmer loading state.

### CurrentSubscriptionCard (`components/settings/subscription/CurrentSubscriptionCard.tsx`)

Shows current subscription: plan name, status pill, billing period dates, cancellation warning. Includes action buttons:
- **Cancel** (danger): two-click confirmation, visible when active and not scheduled for cancellation
- **Resume** (primary): visible when cancellation is scheduled
- **Change plan** (outline): toggles a plan selector grid with the current plan disabled

### PlanSelector (`components/settings/subscription/PlanSelector.tsx`)

Grid of plan cards for initial subscription. Uses `planConfigs` for data and `useCreateSubscriptionCheckout` for the checkout flow.

### PlanCard (`components/settings/subscription/PlanCard.tsx`)

Individual plan card with name, price, credits, feature checklist, and action button. Supports `disabled` and custom `actionLabel` props for reuse in the change-plan flow.

### CreditTransactionHistory (`components/settings/subscription/CreditTransactionHistory.tsx`)

Paginated transaction history. Shows type (French label), date, description, and color-coded amount (green for credits, red for debits). Includes page navigation.

---

## Checkout Flow

```
User clicks "Choisir" on a plan
  -> useCreateSubscriptionCheckout.createCheckout(plan)
  -> POST /api/subscriptions/checkout { plan: "starter" }
  -> Backend creates Stripe Checkout Session
  <- { checkout_url: "https://checkout.stripe.com/..." }
  -> window.location.href = checkout_url (redirect to Stripe)
  -> User completes payment on Stripe
  -> Stripe redirects to /settings/subscription?checkout=success
  -> SubscriptionSettings shows success toast
```

---

## Utility

### formatPriceEur (`utils/priceFormatters.ts`)

Formats a number as euros with French locale: `formatPriceEur(9.99)` → `"9,99 €"`
