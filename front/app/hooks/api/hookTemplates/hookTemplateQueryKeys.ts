export const hookTemplateQueryKeys = {
    all: ['hookTemplates'] as const,
    list: (searchTerm?: string) => [...hookTemplateQueryKeys.all, 'list', searchTerm ?? ''] as const,
}
