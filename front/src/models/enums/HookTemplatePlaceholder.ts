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

export const hookTemplatePlaceholderTranslationKeys: Record<HookTemplatePlaceholder, string> = {
    [HookTemplatePlaceholder.Topic]: "enums:hookTemplatePlaceholder.topic",
    [HookTemplatePlaceholder.Audience]: "enums:hookTemplatePlaceholder.audience",
    [HookTemplatePlaceholder.Benefit]: "enums:hookTemplatePlaceholder.benefit",
    [HookTemplatePlaceholder.Statistic]: "enums:hookTemplatePlaceholder.statistic",
    [HookTemplatePlaceholder.Problem]: "enums:hookTemplatePlaceholder.problem",
    [HookTemplatePlaceholder.Product]: "enums:hookTemplatePlaceholder.product",
    [HookTemplatePlaceholder.Result]: "enums:hookTemplatePlaceholder.result",
    [HookTemplatePlaceholder.Emotion]: "enums:hookTemplatePlaceholder.emotion",
    [HookTemplatePlaceholder.Number]: "enums:hookTemplatePlaceholder.number",
    [HookTemplatePlaceholder.Goal]: "enums:hookTemplatePlaceholder.goal",
    [HookTemplatePlaceholder.Date]: "enums:hookTemplatePlaceholder.date",
}

export const hookTemplatePlaceholderOptions = Object.values(HookTemplatePlaceholder);
