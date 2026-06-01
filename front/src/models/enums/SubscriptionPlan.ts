export enum SubscriptionPlan {
    Starter = 'starter',
    Agency = 'agency',
    AgencyPlus = 'agency+',
}

export const subscriptionPlanOptions = Object.values(SubscriptionPlan);

export const subscriptionPlanTranslationKeys: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.Starter]: "enums:subscriptionPlan.starter",
    [SubscriptionPlan.Agency]: "enums:subscriptionPlan.agency",
    [SubscriptionPlan.AgencyPlus]: "enums:subscriptionPlan.agencyPlus",
};
