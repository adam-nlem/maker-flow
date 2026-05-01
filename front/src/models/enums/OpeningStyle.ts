export enum OpeningStyle {
    BoldHook = 'bold_hook',
    ShockingStat = 'shocking_stat',
    PersonalStory = 'personal_story',
    RelatableQuestion = 'relatable_question',
    JumpIntoContent = 'jump_into_content',
}

export const openingStyleOptions = Object.values(OpeningStyle);

export const openingStyleTranslationKeys: Record<OpeningStyle, string> = {
    [OpeningStyle.BoldHook]: "enums:openingStyle.boldHook",
    [OpeningStyle.ShockingStat]: "enums:openingStyle.shockingStat",
    [OpeningStyle.PersonalStory]: "enums:openingStyle.personalStory",
    [OpeningStyle.RelatableQuestion]: "enums:openingStyle.relatableQuestion",
    [OpeningStyle.JumpIntoContent]: "enums:openingStyle.jumpIntoContent",
}
