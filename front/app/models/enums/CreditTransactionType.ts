export enum CreditTransactionType {
    SubscriptionRenewal = 'subscription_renewal',
    TopupPurchase = 'topup_purchase',
    ScriptGeneration = 'script_generation',
    Refund = 'refund',
    ManualAdjustment = 'manual_adjustment',
}

export const creditTransactionTypeOptions = Object.values(CreditTransactionType);

export const creditTransactionTypeToFrenchTranslation: Record<CreditTransactionType, string> = {
    [CreditTransactionType.SubscriptionRenewal]: "Renouvellement",
    [CreditTransactionType.TopupPurchase]: "Recharge",
    [CreditTransactionType.ScriptGeneration]: "Génération de script",
    [CreditTransactionType.Refund]: "Remboursement",
    [CreditTransactionType.ManualAdjustment]: "Ajustement",
};
