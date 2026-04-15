export enum Platform {
    Instagram = 'instagram',
    Youtube = 'youtube',
    Tiktok = 'tiktok',
}

export const platformToFrenchTranslation: Record<Platform, string> = {
    [Platform.Instagram]: "Instagram",
    [Platform.Youtube]: "YouTube",
    [Platform.Tiktok]: "TikTok",
}

export const platformOptions = Object.values(Platform)

export const platformToBgClass: Record<Platform, string> = {
    [Platform.Instagram]: "bg-purple/10",
    [Platform.Youtube]: "bg-red/10",
    [Platform.Tiktok]: "bg-primary/10",
}

export const platformToBgFullClass: Record<Platform, string> = {
    [Platform.Instagram]: "bg-purple",
    [Platform.Youtube]: "bg-red",
    [Platform.Tiktok]: "bg-primary",
}

export const platformToBorderClass: Record<Platform, string> = {
    [Platform.Instagram]: "border border-purple/30",
    [Platform.Youtube]: "border border-red/30",
    [Platform.Tiktok]: "border border-primary/30",
}

export const platformToTextClass: Record<Platform, string> = {
    [Platform.Instagram]: "text-purple",
    [Platform.Youtube]: "text-red",
    [Platform.Tiktok]: "text-primary",
}

export const platformToIcon: Record<Platform, string> = {
    [Platform.Instagram]: "/icons/platforms/instagram.svg",
    [Platform.Youtube]: "/icons/platforms/youtube.svg",
    [Platform.Tiktok]: "/icons/platforms/tiktok.svg",
}

export const platformToChartColor: Record<Platform, string> = {
    [Platform.Instagram]: "var(--color-purple)",
    [Platform.Youtube]: "var(--color-red)",
    [Platform.Tiktok]: "var(--color-primary)",
}

export const PLATFORM_PLACEHOLDER_ICON = "/icons/platforms/placeholder.svg";
