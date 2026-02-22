export enum HookTemplatePlaceholder {
    Topic = 'topic',
    Audience = 'audience',
    Benefit = 'benefit',
    Statistic = 'statistic',
    Problem = 'problem',
    Product = 'product',
    Result = 'result',
    Emotion = 'emotion',
    Number = 'number',
    Goal = 'goal',
    Date = 'date',

}

export const hookTemplatePlaceholderToFrenchTranslation: Record<HookTemplatePlaceholder, string> = {
    [HookTemplatePlaceholder.Topic]: "Sujet",
    [HookTemplatePlaceholder.Audience]: "Audience",
    [HookTemplatePlaceholder.Benefit]: "Bénéfice",
    [HookTemplatePlaceholder.Statistic]: "Statistique",
    [HookTemplatePlaceholder.Problem]: "Problème",
    [HookTemplatePlaceholder.Product]: "Produit",
    [HookTemplatePlaceholder.Result]: "Résultat",
    [HookTemplatePlaceholder.Emotion]: "Émotion",
    [HookTemplatePlaceholder.Number]: "Nombre",
    [HookTemplatePlaceholder.Goal]: "Objectif",
    [HookTemplatePlaceholder.Date]: "date",
}
