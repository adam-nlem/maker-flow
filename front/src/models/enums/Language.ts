export enum Language {
    Fr = 'fr',
    En = 'en',
}

export const languageOptions = Object.values(Language);

export const languageToLabel: Record<Language, string> = {
    [Language.Fr]: 'Français',
    [Language.En]: 'English',
}
