export enum IntegrationProvider {
    Instagram = 'instagram',
    Youtube = 'youtube',
    Tiktok = 'tiktok',
}

export const integrationProviderToFrenchTranslation: Record<IntegrationProvider, string> = {
    [IntegrationProvider.Instagram]: "Instagram",
    [IntegrationProvider.Youtube]: "Youtube",
    [IntegrationProvider.Tiktok]: "Tiktok",
}


export const integrationProviderTypeOptions = Object.values(IntegrationProvider)