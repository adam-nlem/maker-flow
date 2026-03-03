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
    [Platform.Instagram]: "bg-purple/30",
    [Platform.Youtube]: "bg-red/30",
    [Platform.Tiktok]: "bg-dark/30",
}

export const platformToTextClass: Record<Platform, string> = {
    [Platform.Instagram]: "text-purple",
    [Platform.Youtube]: "text-red",
    [Platform.Tiktok]: "text-dark",
}

export const platformToIcon: Record<Platform, string> = {
    [Platform.Instagram]: "/icons/platforms/instagram.svg",
    [Platform.Youtube]: "/icons/platforms/youtube.svg",
    [Platform.Tiktok]: "/icons/platforms/tiktok.svg",
}

export const PLATFORM_PLACEHOLDER_ICON = "/icons/platforms/placeholder.svg";
