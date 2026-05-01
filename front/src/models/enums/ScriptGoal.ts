export enum ScriptGoal {
    Educate = 'educate',
    Entertain = 'entertain',
    Inspire = 'inspire',
    SellPromote = 'sell_promote',
    GrowAudience = 'grow_audience',
    StartConversation = 'start_conversation',
}

export const scriptGoalOptions = Object.values(ScriptGoal);

export const scriptGoalTranslationKeys: Record<ScriptGoal, string> = {
    [ScriptGoal.Educate]: "enums:scriptGoal.educate",
    [ScriptGoal.Entertain]: "enums:scriptGoal.entertain",
    [ScriptGoal.Inspire]: "enums:scriptGoal.inspire",
    [ScriptGoal.SellPromote]: "enums:scriptGoal.sellPromote",
    [ScriptGoal.GrowAudience]: "enums:scriptGoal.growAudience",
    [ScriptGoal.StartConversation]: "enums:scriptGoal.startConversation",
}
