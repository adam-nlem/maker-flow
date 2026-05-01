export enum SkillModule {
    StrongHook = 'strong_hook',
    RetentionBoosters = 'retention_boosters',
    StorytellingMode = 'storytelling_mode',
    SeoOptimization = 'seo_optimization',
    ScriptFormat = 'script_format',
    BRollCues = 'b_roll_cues',
    CallToAction = 'call_to_action',
}

export const skillModuleTranslationKeys: Record<SkillModule, string> = {
    [SkillModule.StrongHook]: "enums:skillModule.names.strongHook",
    [SkillModule.RetentionBoosters]: "enums:skillModule.names.retentionBoosters",
    [SkillModule.StorytellingMode]: "enums:skillModule.names.storytellingMode",
    [SkillModule.SeoOptimization]: "enums:skillModule.names.seoOptimization",
    [SkillModule.ScriptFormat]: "enums:skillModule.names.scriptFormat",
    [SkillModule.BRollCues]: "enums:skillModule.names.bRollCues",
    [SkillModule.CallToAction]: "enums:skillModule.names.callToAction",
}

export const skillModuleDescriptionKeys: Record<SkillModule, string> = {
    [SkillModule.StrongHook]: "enums:skillModule.descriptions.strongHook",
    [SkillModule.RetentionBoosters]: "enums:skillModule.descriptions.retentionBoosters",
    [SkillModule.StorytellingMode]: "enums:skillModule.descriptions.storytellingMode",
    [SkillModule.SeoOptimization]: "enums:skillModule.descriptions.seoOptimization",
    [SkillModule.ScriptFormat]: "enums:skillModule.descriptions.scriptFormat",
    [SkillModule.BRollCues]: "enums:skillModule.descriptions.bRollCues",
    [SkillModule.CallToAction]: "enums:skillModule.descriptions.callToAction",
}

export const skillModuleHasExtraInput: Record<SkillModule, boolean> = {
    [SkillModule.StrongHook]: false,
    [SkillModule.RetentionBoosters]: true,
    [SkillModule.StorytellingMode]: true,
    [SkillModule.SeoOptimization]: true,
    [SkillModule.ScriptFormat]: true,
    [SkillModule.BRollCues]: false,
    [SkillModule.CallToAction]: true,
}

export type SkillModuleExtraInputType = 'text' | 'select';

export const skillModuleExtraInputType: Partial<Record<SkillModule, SkillModuleExtraInputType>> = {
    [SkillModule.StorytellingMode]: 'text',
    [SkillModule.SeoOptimization]: 'text',
    [SkillModule.ScriptFormat]: 'select',
    [SkillModule.CallToAction]: 'select',
    [SkillModule.RetentionBoosters]: 'select',
}

export const skillModuleOptions = Object.values(SkillModule);
