export enum HookTemplateCategory {
    All = 'all',
    Public = 'public',
    Private = 'private',
}

export const hookTemplateCategoryToFrenchTranslation: Record<HookTemplateCategory, string> = {
    [HookTemplateCategory.All]: "Tous",
    [HookTemplateCategory.Public]: "Publics",
    [HookTemplateCategory.Private]: "Privés",
}

export const hookTemplateCategoryOptions = Object.values(HookTemplateCategory);
