export enum SourceBucket {
    SubscriptionCredits = 'subscription_credits',
    TopupCredits = 'topup_credits',
}

export const sourceBucketOptions = Object.values(SourceBucket);

export const sourceBucketToFrenchTranslation: Record<SourceBucket, string> = {
    [SourceBucket.SubscriptionCredits]: "Abonnement",
    [SourceBucket.TopupCredits]: "Recharge",
};
