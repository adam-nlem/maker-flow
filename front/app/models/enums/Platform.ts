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
