export enum PrelaunchRewardTier {
    EarlyBetaAccess = 'early_beta_access',
    DevDiscordAccess = 'dev_discord_access',
    LifetimeDiscount = 'lifetime_discount',
}

export const prelaunchRewardTierOptions = Object.values(PrelaunchRewardTier)

export const prelaunchRewardTierToLabel: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "Accès anticipé à la bêta",
    [PrelaunchRewardTier.DevDiscordAccess]: "Accès au Discord développeurs",
    [PrelaunchRewardTier.LifetimeDiscount]: "20% de réduction à vie",
}

export const prelaunchRewardTierToDescription: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "Soyez parmi les premiers à tester MakerFlow avant tout le monde.",
    [PrelaunchRewardTier.DevDiscordAccess]: "Rejoignez notre Discord privé pour donner votre avis et influencer le développement.",
    [PrelaunchRewardTier.LifetimeDiscount]: "Profitez de 20% de réduction sur tous les abonnements, à vie.",
}

export const prelaunchRewardTierToThreshold: Record<PrelaunchRewardTier, number> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: 5,
    [PrelaunchRewardTier.DevDiscordAccess]: 10,
    [PrelaunchRewardTier.LifetimeDiscount]: 25,
}
