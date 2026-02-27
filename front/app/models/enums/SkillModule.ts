export enum SkillModule {
    StrongHook = 'strong_hook',
    RetentionBoosters = 'retention_boosters',
    StorytellingMode = 'storytelling_mode',
    SeoOptimization = 'seo_optimization',
    ScriptFormat = 'script_format',
    BRollCues = 'b_roll_cues',
    CallToAction = 'call_to_action',
}

export const skillModuleToFrenchTranslation: Record<SkillModule, string> = {
    [SkillModule.StrongHook]: "Accroche forte",
    [SkillModule.RetentionBoosters]: "Boosters de rétention",
    [SkillModule.StorytellingMode]: "Mode storytelling",
    [SkillModule.SeoOptimization]: "Optimisation SEO",
    [SkillModule.ScriptFormat]: "Format du script",
    [SkillModule.BRollCues]: "Indications B-Roll",
    [SkillModule.CallToAction]: "Appel à l'action",
}

export const skillModuleToDescription: Record<SkillModule, string> = {
    [SkillModule.StrongHook]: "Les 3 premières secondes créent de la curiosité ou une affirmation audacieuse",
    [SkillModule.RetentionBoosters]: "Un moment de ré-engagement toutes les 60-90 secondes",
    [SkillModule.StorytellingMode]: "Ancrer le script dans une histoire personnelle",
    [SkillModule.SeoOptimization]: "Intégrer naturellement un mot-clé cible",
    [SkillModule.ScriptFormat]: "Choisir le format de sortie : script complet, plan ou hybride",
    [SkillModule.BRollCues]: "Ajouter des indications de B-Roll visuelles dans le script",
    [SkillModule.CallToAction]: "Ajouter un appel à l'action dans le script",
}

export const skillModuleHasExtraInput: Record<SkillModule, boolean> = {
    [SkillModule.StrongHook]: false,
    [SkillModule.RetentionBoosters]: false,
    [SkillModule.StorytellingMode]: true,
    [SkillModule.SeoOptimization]: true,
    [SkillModule.ScriptFormat]: true,
    [SkillModule.BRollCues]: false,
    [SkillModule.CallToAction]: false,
}

export type SkillModuleExtraInputType = 'text' | 'select';

export const skillModuleExtraInputType: Partial<Record<SkillModule, SkillModuleExtraInputType>> = {
    [SkillModule.StorytellingMode]: 'text',
    [SkillModule.SeoOptimization]: 'text',
    [SkillModule.ScriptFormat]: 'select',
}
