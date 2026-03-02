export enum SubscriptionStatus {
    Active = 'active',
    PastDue = 'past_due',
    Canceled = 'canceled',
    Incomplete = 'incomplete',
    Trialing = 'trialing',
    Unpaid = 'unpaid',
}

export const subscriptionStatusOptions = Object.values(SubscriptionStatus);

export const subscriptionStatusToFrenchTranslation: Record<SubscriptionStatus, string> = {
    [SubscriptionStatus.Active]: "Actif",
    [SubscriptionStatus.PastDue]: "En retard",
    [SubscriptionStatus.Canceled]: "Annulé",
    [SubscriptionStatus.Incomplete]: "Incomplet",
    [SubscriptionStatus.Trialing]: "Essai",
    [SubscriptionStatus.Unpaid]: "Impayé",
};
