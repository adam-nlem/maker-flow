export enum IntegrationPlatform {
    Instagram = 'instagram',
    Youtube = 'youtube',
    Tiktok = 'tiktok',
}

export const integrationPlatformToFrenchTranslation: Record<IntegrationPlatform, string> = {
    [IntegrationPlatform.Instagram]: "Instagram",
    [IntegrationPlatform.Youtube]: "Youtube",
    [IntegrationPlatform.Tiktok]: "Tiktok",
}


export const integrationPlatformTypeOptions = Object.values(IntegrationPlatform)
