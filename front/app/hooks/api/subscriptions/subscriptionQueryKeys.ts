export const subscriptionQueryKeys = {
    all: ['subscriptions'] as const,
    current: () => [...subscriptionQueryKeys.all, 'current'] as const,
    plans: () => [...subscriptionQueryKeys.all, 'plans'] as const,
};
