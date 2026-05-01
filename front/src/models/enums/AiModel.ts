export enum AiModel {
  Gemini = 'gemini',
  ChatGpt = 'chat_gpt',
  Claude = 'claude',
}

export const aiModelOptions = Object.values(AiModel);

export const aiModelTranslationKeys: Record<AiModel, string> = {
  [AiModel.Gemini]: 'enums:aiModel.names.gemini',
  [AiModel.ChatGpt]: 'enums:aiModel.names.chatGpt',
  [AiModel.Claude]: 'enums:aiModel.names.claude',
};

export const aiModelDescriptionKeys: Record<AiModel, string> = {
  [AiModel.Gemini]: 'enums:aiModel.descriptions.gemini',
  [AiModel.ChatGpt]: 'enums:aiModel.descriptions.chatGpt',
  [AiModel.Claude]: 'enums:aiModel.descriptions.claude',
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
