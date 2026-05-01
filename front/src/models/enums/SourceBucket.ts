export enum SourceBucket {
    SubscriptionCredits = 'subscription_credits',
    RefillCredits = 'refill_credits',
}

export const sourceBucketOptions = Object.values(SourceBucket);

export const sourceBucketTranslationKeys: Record<SourceBucket, string> = {
    [SourceBucket.SubscriptionCredits]: "enums:sourceBucket.subscriptionCredits",
    [SourceBucket.RefillCredits]: "enums:sourceBucket.refillCredits",
};
