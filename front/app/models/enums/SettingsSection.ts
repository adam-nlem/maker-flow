export enum SettingsSection {
    General = 'general',
    CreatorProfile = 'creator_profile',
    Project = 'project',
}

export const settingsSectionOptions = Object.values(SettingsSection);

export const settingsSectionToFrenchTranslation: Record<SettingsSection, string> = {
    [SettingsSection.General]: "Général",
    [SettingsSection.CreatorProfile]: "Profil créateur",
    [SettingsSection.Project]: "Projet",
}
