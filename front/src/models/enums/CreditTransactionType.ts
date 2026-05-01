export enum CreditTransactionType {
    SubscriptionRenewal = 'subscription_renewal',
    RefillPurchase = 'refill_purchase',
    ScriptGeneration = 'script_generation',
    ScriptGenerationRefund = 'script_generation_refund',
    Refund = 'refund',
    ManualAdjustment = 'manual_adjustment',
    WelcomeBonus = 'welcome_bonus',
}

export const creditTransactionTypeOptions = Object.values(CreditTransactionType);

export const creditTransactionTypeTranslationKeys: Record<CreditTransactionType, string> = {
    [CreditTransactionType.SubscriptionRenewal]: "enums:creditTransactionType.subscriptionRenewal",
    [CreditTransactionType.RefillPurchase]: "enums:creditTransactionType.refillPurchase",
    [CreditTransactionType.ScriptGeneration]: "enums:creditTransactionType.scriptGeneration",
    [CreditTransactionType.ScriptGenerationRefund]: "enums:creditTransactionType.scriptGenerationRefund",
    [CreditTransactionType.Refund]: "enums:creditTransactionType.refund",
    [CreditTransactionType.ManualAdjustment]: "enums:creditTransactionType.manualAdjustment",
    [CreditTransactionType.WelcomeBonus]: "enums:creditTransactionType.welcomeBonus",
};
