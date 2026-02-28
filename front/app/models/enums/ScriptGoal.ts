export enum ScriptGoal {
    Educate = 'educate',
    Entertain = 'entertain',
    Inspire = 'inspire',
    SellPromote = 'sell_promote',
    GrowAudience = 'grow_audience',
    StartConversation = 'start_conversation',
}

export const scriptGoalOptions = Object.values(ScriptGoal);

export const scriptGoalToFrenchTranslation: Record<ScriptGoal, string> = {
    [ScriptGoal.Educate]: "Éduquer",
    [ScriptGoal.Entertain]: "Divertir",
    [ScriptGoal.Inspire]: "Inspirer",
    [ScriptGoal.SellPromote]: "Vendre / Promouvoir",
    [ScriptGoal.GrowAudience]: "Développer l'audience",
    [ScriptGoal.StartConversation]: "Lancer une conversation",
}
