export enum HookTemplateCategory {
    All = 'all',
    Public = 'public',
    Private = 'private',
}

export const hookTemplateCategoryTranslationKeys: Record<HookTemplateCategory, string> = {
    [HookTemplateCategory.All]: "enums:hookTemplateCategory.all",
    [HookTemplateCategory.Public]: "enums:hookTemplateCategory.public",
    [HookTemplateCategory.Private]: "enums:hookTemplateCategory.private",
}

export const hookTemplateCategoryOptions = Object.values(HookTemplateCategory);
