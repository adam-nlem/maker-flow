export enum SubscriptionPlan {
    Starter = 'starter',
    Creator = 'creator',
    Agency = 'agency',
}

export const subscriptionPlanOptions = Object.values(SubscriptionPlan);

export const subscriptionPlanTranslationKeys: Record<SubscriptionPlan, string> = {
    [SubscriptionPlan.Starter]: "enums:subscriptionPlan.starter",
    [SubscriptionPlan.Creator]: "enums:subscriptionPlan.creator",
    [SubscriptionPlan.Agency]: "enums:subscriptionPlan.agency",
};
