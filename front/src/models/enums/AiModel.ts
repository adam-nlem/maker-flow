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

export const aiModelToIcon: Record<AiModel, string> = {
  [AiModel.Gemini]: '/icons/aiModels/gemini.png',
  [AiModel.ChatGpt]: '/icons/aiModels/chat_gpt.svg',
  [AiModel.Claude]: '/icons/aiModels/claude.svg',
};

export const aiModelToBgClass: Record<AiModel, string> = {
  [AiModel.Gemini]: 'bg-blue/10',
  [AiModel.ChatGpt]: 'bg-purple/10',
  [AiModel.Claude]: 'bg-yellow/10',
}


export const aiModelToBorderClass: Record<AiModel, string> = {
  [AiModel.Gemini]: 'border border-blue/30',
  [AiModel.ChatGpt]: 'border border-purple/30',
  [AiModel.Claude]: 'border border-yellow/30',
}

export const aiModelToTextClass: Record<AiModel, string> = {
  [AiModel.Gemini]: 'text-blue',
  [AiModel.ChatGpt]: 'texet-purple',
  [AiModel.Claude]: 'text-yellow',
}
