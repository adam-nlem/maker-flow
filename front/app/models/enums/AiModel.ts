export enum AiModel {
    Gemini = 'gemini',
    ChatGpt = 'chat_gpt',
    Claude = 'claude',
}

export const aiModelOptions = Object.values(AiModel);

export const aiModelToFrenchTranslation: Record<AiModel, string> = {
    [AiModel.Gemini]: 'Gemini',
    [AiModel.ChatGpt]: 'ChatGPT',
    [AiModel.Claude]: 'Claude',
};

export const aiModelToDescription: Record<AiModel, string> = {
    [AiModel.Gemini]: 'Google — rapide et créatif',
    [AiModel.ChatGpt]: 'OpenAI — précis et structuré',
    [AiModel.Claude]: 'Anthropic — nuancé et détaillé',
};
