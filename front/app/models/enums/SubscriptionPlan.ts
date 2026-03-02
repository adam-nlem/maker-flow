export enum SubscriptionPlan {
    Free = 'free',
    Starter = 'starter',
    Creator = 'creator',
    Agency = 'agency',
}

export const subscriptionPlanOptions = Object.values(SubscriptionPlan);

export const subscriptionPlanToFrenchTranslation: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.Free]: "Gratuit",
    [SubscriptionPlan.Starter]: "Starter",
    [SubscriptionPlan.Creator]: "Créateur",
    [SubscriptionPlan.Agency]: "Agence",
};
