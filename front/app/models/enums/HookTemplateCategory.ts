export enum HookTemplateCategory {
    All = 'all',
    Public = 'public',
    Private = 'private',
    Recent = 'recent',
}

export const hookTemplateCategoryToFrenchTranslation: Record<HookTemplateCategory, string> = {
    [HookTemplateCategory.All]: "Tous",
    [HookTemplateCategory.Public]: "Publics",
    [HookTemplateCategory.Private]: "Privés",
    [HookTemplateCategory.Recent]: "Récents",
}

export const hookTemplateCategoryOptions = Object.values(HookTemplateCategory);
