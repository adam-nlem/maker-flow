export enum ScriptFormat {
    FullScript = 'full_script',
    Outline = 'outline',
    Hybrid = 'hybrid',
}

export const scriptFormatToFrenchTranslation: Record<ScriptFormat, string> = {
    [ScriptFormat.FullScript]: "Script complet",
    [ScriptFormat.Outline]: "Plan détaillé",
    [ScriptFormat.Hybrid]: "Hybride",
}

export const scriptFormatOptions = Object.values(ScriptFormat);
