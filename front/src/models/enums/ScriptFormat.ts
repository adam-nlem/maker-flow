export enum ScriptFormat {
    FullScript = 'full_script',
    Outline = 'outline',
    Hybrid = 'hybrid',
}

export const scriptFormatTranslationKeys: Record<ScriptFormat, string> = {
    [ScriptFormat.FullScript]: "enums:scriptFormat.fullScript",
    [ScriptFormat.Outline]: "enums:scriptFormat.outline",
    [ScriptFormat.Hybrid]: "enums:scriptFormat.hybrid",
}

export const scriptFormatOptions = Object.values(ScriptFormat);
