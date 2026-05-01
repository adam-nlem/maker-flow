export enum SubscriptionStatus {
    Active = 'active',
    PastDue = 'past_due',
    Canceled = 'canceled',
    Incomplete = 'incomplete',
    Trialing = 'trialing',
    Unpaid = 'unpaid',
}

export const subscriptionStatusOptions = Object.values(SubscriptionStatus);

export const subscriptionStatusTranslationKeys: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.Active]: "enums:subscriptionStatus.active",
    [SubscriptionStatus.PastDue]: "enums:subscriptionStatus.pastDue",
    [SubscriptionStatus.Canceled]: "enums:subscriptionStatus.canceled",
    [SubscriptionStatus.Incomplete]: "enums:subscriptionStatus.incomplete",
    [SubscriptionStatus.Trialing]: "enums:subscriptionStatus.trialing",
    [SubscriptionStatus.Unpaid]: "enums:subscriptionStatus.unpaid",
};
