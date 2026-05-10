# Billing Feature - Frontend

## Overview

The billing frontend displays credit balances, current subscription information, and a plan selector for subscribing via Stripe Checkout. It lives under the `/agency/settings/subscription` route.

---

## Settings Sub-routing

The settings page uses React Router 7 nested routes with a dynamic `:section` parameter.

### Route Configuration (`router.tsx`)

```tsx
{
    path: agencySettingsPath,                                // /agency/settings
    element: <AgencySettingsLayout />,
    children: [
        { index: true, element: <AgencySettingsIndex /> },         // → redirect to /agency/settings/general
        { path: ":section", element: <AgencySettingsSectionRoute /> },
    ],
},
```

### Key Files

| File | Purpose |
|------|---------|
| `routes/agency/settings.tsx` | Layout: renders `SettingsPageView` |
| `routes/agency/settings.index.tsx` | Redirects `/agency/settings` to `/agency/settings/general` |
| `routes/agency/settings.section.tsx` | Maps `:section` param to the correct component |
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
| Starter | `starter` |
| Creator | `creator` |
| Agency | `agency` |

> **Note:** There is no `Free` case. A "free user" is simply a user with no subscription (API returns 404).

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
| RefillPurchase | `refill_purchase` |
| ScriptGeneration | `script_generation` |
| Refund | `refund` |
| ManualAdjustment | `manual_adjustment` |

Exports: `creditTransactionTypeOptions`, `creditTransactionTypeToFrenchTranslation`

### SourceBucket (`models/enums/SourceBucket.ts`)

| Case | Value |
|------|-------|
| SubscriptionCredits | `subscription_credits` |
| RefillCredits | `refill_credits` |

Exports: `sourceBucketOptions`, `sourceBucketToFrenchTranslation`

---

## Models

### CreditBalance (`models/CreditBalance.ts`)

| Property | Type | Description |
|----------|------|-------------|
| `uuid` | string | Public identifier |
| `subscriptionCredits` | number | Credits from subscription renewals |
| `refillCredits` | number | Credits from refill purchases |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date \| null | Last update timestamp |

Computed getter: `totalCredits` returns `subscriptionCredits + refillCredits`.

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

## Plan Config DTO (`dtos/subscriptions/PlanConfigDTO.ts`)

Plan display data is fetched from Stripe via the `GET /api/subscriptions/plans` endpoint. Stripe is the single source of truth — there is no hardcoded config file.

```ts
export class PlanConfigDTO {
    plan: SubscriptionPlan;
    name: string;
    monthlyPrice: number;
    currency: string;
    creditsPerMonth: number;
    maxProjects: number | null;
    maxScriptsPerProject: number | null;
    features: string[];
    isHighlighted: boolean;
    sortOrder: number;

    static fromJSON(json: PlanConfigDTOJSON): PlanConfigDTO;
}
```

Plan limits are accessed by looking up the current plan in the `useListPlans()` hook result:
```ts
const { plans } = useListPlans();
const currentPlanConfig = plans.find((p) => p.plan === subscription?.plan);
const maxProjects = subscription ? (currentPlanConfig?.maxProjects ?? null) : 1;
```

---

## Plan-Based Feature Restrictions

### `useIsSubscribed` Hook (`hooks/useIsSubscribed.ts`)

Convenience hook that wraps `useShowCurrentSubscription`. Returns `{ isSubscribed: boolean, isLoading: boolean }`. A user is considered subscribed if they have a subscription AND it is active (`subscription.isActive`). The API returns any subscription (including inactive/expired) so the settings page can display it.

### `PremiumOverlay` Component (`components/ui/PremiumOverlay.tsx`)

Reusable overlay for premium-only content. Wraps children with a blur effect and upgrade CTA when `isRestricted` is true.

Props:
- `isRestricted: boolean` -- whether to show the overlay
- `title?: string` -- overlay heading (default: "Fonctionnalite Premium")
- `description?: string` -- overlay description
- `children: ReactNode` -- content to blur/show

When restricted, children are rendered with `blur-sm pointer-events-none select-none` and an absolute overlay shows a lock icon, heading, description, and a primary Button navigating to `/agency/settings/subscription`.

### Current Frontend Restrictions

Premium pages **do not call the API** when the user is not subscribed — they show `PremiumOverlay` as the full page content. This prevents data leaks (no premium data in the DOM). The `enabled` option in React Query hooks controls whether the API call is made.

| Feature | Component | Behavior |
|---------|-----------|----------|
| Script creation | `ScriptListPanel` | "+" button disabled when `scripts.length >= maxScriptsPerProject` (limit from `useListPlans()`). Catches 402 from backend. |
| Post detail page | `PostDetailPageView` | API call skipped via `enabled: isSubscribed`. Full `PremiumOverlay` shown instead of page content. Breadcrumb remains visible. |
| Integration detail page | `IntegrationPageView` | API call skipped via `enabled: isSubscribed`. Full `PremiumOverlay` shown instead of detail content. |
| Home aggregated view | `home.tsx` (parent) | Full `PremiumOverlay` replaces both `HomeInsightsOverview` and `RankedPostGroupsList` when "Toutes les plateformes" is selected and user is not subscribed. No API calls made. Pill row stays visible. Per-integration views remain accessible. |
| Insights aggregated view | `InsightsPageView` | Full `PremiumOverlay` shown when "Toutes les plateformes" is selected and user is not subscribed. Per-integration views remain accessible. |
| Evolution percentages | All insight components | Backend returns null for `evolutionPercentage` in post list. Existing components (`PostEvolutionBadge`, `InsightTile`, `PostInsightSummaryCard`) already hide when null. |

---

## API Hooks

### Query Keys

| File | Keys |
|------|------|
| `hooks/api/credits/creditQueryKeys.ts` | `all`, `balance()`, `transactions(page, limit)` |
| `hooks/api/subscriptions/subscriptionQueryKeys.ts` | `all`, `current()`, `plans()` |

### Hooks

| Hook | Endpoint | Returns |
|------|----------|---------|
| `useShowCreditBalance` | `GET /api/credits/balance` | `{ creditBalance, isLoading, error }` |
| `useListPlans` | `GET /api/subscriptions/plans` | `{ plans, isLoading, error }`. Plans fetched from Stripe via backend, cached with 30min staleTime. |
| `useShowCurrentSubscription` | `GET /api/subscriptions/current` | `{ subscription, isLoading, error }` (null if no subscription). Accepts optional `{ refetchInterval }` for polling. |
| `useCreateSubscriptionCheckout` | `POST /api/subscriptions/checkout` | `{ createCheckout, isPending, error }` (redirects to Stripe on success). `createCheckout({ plan, checkoutRedirectPath? })` — optional base path for Stripe redirect (backend appends `?checkout=success` / `?checkout=cancel`). |
| `useCancelSubscription` | `POST /api/subscriptions/cancel` | `{ cancelSubscription, isPending, error }` (invalidates subscription query) |
| `useResumeSubscription` | `POST /api/subscriptions/resume` | `{ resumeSubscription, isPending, error }` (invalidates subscription query) |
| `useCreateRefillCheckout` | `POST /api/credits/refill/checkout` | `{ createRefillCheckout, isPending, error }` (redirects to Stripe on success) |
| `useListCreditTransactions` | `GET /api/credits/transactions` | `{ transactions, isLoading, error }` (paginated) |

---

## Components

### SubscriptionSettings (`components/settings/SubscriptionSettings.tsx`)

Layout component for the subscription settings page. Displays:
1. Credit balance card with refill button (always)
2. `SubscriptionOverview` — handles subscription status and plan selection
3. Credit transaction history (always, hidden if no transactions)

### SubscriptionOverview (`components/settings/subscription/SubscriptionOverview.tsx`)

Shared component used by both the settings page and the onboarding flow. Encapsulates:
- Subscription fetching via `useShowCurrentSubscription()` (with polling when `?checkout=success` is detected)
- Checkout success handling: shows toast + clears search params once subscription is confirmed
- Conditional rendering: loading shimmer → subscribed view → plan selector

Props:
- `checkoutRedirectPath?: string` — base path for Stripe redirect (backend appends `?checkout=success` / `?checkout=cancel`), passed to `PlanSelector`
- `subscribedView?: (subscription: Subscription) => ReactNode` — custom render when subscribed. Defaults to `CurrentSubscriptionCard`.
- `loadingView?: ReactNode` — custom loading shimmer. Defaults to a bordered shimmer card.

### CreditBalanceCard (`components/settings/subscription/CreditBalanceCard.tsx`)

Displays total credits with subscription/refill breakdown and a "Recharger" refill button. Shows shimmer loading state.

### CurrentSubscriptionCard (`components/settings/subscription/CurrentSubscriptionCard.tsx`)

Shows current subscription: plan name, status pill, billing period dates, cancellation warning. Includes action buttons:
- **Cancel** (danger): two-click confirmation, visible when active and not scheduled for cancellation
- **Resume** (primary): visible when cancellation is scheduled
- **Change plan** (outline): toggles a plan selector grid with the current plan disabled

### PlanSelector (`components/settings/subscription/PlanSelector.tsx`)

Grid of plan cards for initial subscription. Uses `useListPlans()` to fetch plan data from the API and `useCreateSubscriptionCheckout` for the checkout flow. Shows shimmer loading state while plans load. Accepts optional `checkoutRedirectPath` prop to override the base redirect path (used by `OnboardingSubscriptionStep` to redirect back to `/onboarding`) and `disabledPlan` to disable the current plan in the change-plan flow.

### PlanCard (`components/settings/subscription/PlanCard.tsx`)

Individual plan card with name, price, credits, feature checklist, and action button. Accepts `config: PlanConfigDTO` prop. Supports `disabled` and custom `actionLabel` props for reuse in the change-plan flow.

### CreditTransactionHistory (`components/settings/subscription/CreditTransactionHistory.tsx`)

Paginated transaction history. Shows type (French label), date, description, and color-coded amount (green for credits, red for debits). Includes page navigation.

---

## Checkout Flow

```
User clicks "Choisir" on a plan
  -> useCreateSubscriptionCheckout.createCheckout({ plan, checkoutRedirectPath? })
  -> POST /api/subscriptions/checkout { plan: "starter", checkout_redirect_path?: "/onboarding" }
  -> Backend creates Stripe Checkout Session (appends ?checkout=success / ?checkout=cancel to the redirect path, defaults to /settings/subscription)
  <- { checkout_url: "https://checkout.stripe.com/..." }
  -> window.location.href = checkout_url (redirect to Stripe)
  -> User completes payment on Stripe
  -> Stripe redirects to success_url (settings or onboarding)
  -> Target page shows success toast
```

---

## Utility

### formatPriceEur (`utils/priceFormatters.ts`)

Formats a number as euros with French locale: `formatPriceEur(9.99)` → `"9,99 €"`
