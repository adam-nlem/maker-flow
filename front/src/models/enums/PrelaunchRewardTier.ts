export enum PrelaunchRewardTier {
    EarlyBetaAccess = 'early_beta_access',
    DevDiscordAccess = 'dev_discord_access',
    LifetimeDiscount = 'lifetime_discount',
}

export const prelaunchRewardTierOptions = Object.values(PrelaunchRewardTier)

export const prelaunchRewardTierLabelKeys: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "enums:prelaunchRewardTier.labels.earlyBetaAccess",
    [PrelaunchRewardTier.DevDiscordAccess]: "enums:prelaunchRewardTier.labels.devDiscordAccess",
    [PrelaunchRewardTier.LifetimeDiscount]: "enums:prelaunchRewardTier.labels.lifetimeDiscount",
}

export const prelaunchRewardTierDescriptionKeys: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "enums:prelaunchRewardTier.descriptions.earlyBetaAccess",
    [PrelaunchRewardTier.DevDiscordAccess]: "enums:prelaunchRewardTier.descriptions.devDiscordAccess",
    [PrelaunchRewardTier.LifetimeDiscount]: "enums:prelaunchRewardTier.descriptions.lifetimeDiscount",
}

export const prelaunchRewardTierToThreshold: Record<PrelaunchRewardTier, number> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: 5,
    [PrelaunchRewardTier.DevDiscordAccess]: 10,
    [PrelaunchRewardTier.LifetimeDiscount]: 25,
}

export const prelaunchRewardTierToBgClass: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "bg-primary/10",
    [PrelaunchRewardTier.DevDiscordAccess]: "bg-yellow/10",
    [PrelaunchRewardTier.LifetimeDiscount]: "bg-red/10",
}

export const prelaunchRewardTierToTextClass: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "text-primary",
    [PrelaunchRewardTier.DevDiscordAccess]: "text-yellow",
    [PrelaunchRewardTier.LifetimeDiscount]: "text-red",
}

export const prelaunchRewardTierToBorderClass: Record<PrelaunchRewardTier, string> = {
    [PrelaunchRewardTier.EarlyBetaAccess]: "border-primary/30",
    [PrelaunchRewardTier.DevDiscordAccess]: "border-yellow/30",
    [PrelaunchRewardTier.LifetimeDiscount]: "border-red/30",
}
