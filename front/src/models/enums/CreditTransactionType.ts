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

export const creditTransactionTypeToFrenchTranslation: Record<CreditTransactionType, string> = {
    [CreditTransactionType.SubscriptionRenewal]: "Renouvellement",
    [CreditTransactionType.RefillPurchase]: "Recharge",
    [CreditTransactionType.ScriptGeneration]: "Génération de script",
    [CreditTransactionType.ScriptGenerationRefund]: "Remboursement suite a une génération de script echouée",
    [CreditTransactionType.Refund]: "Remboursement",
    [CreditTransactionType.ManualAdjustment]: "Ajustement",
    [CreditTransactionType.WelcomeBonus]: "Crédits de bienvenue",
};
