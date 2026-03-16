export enum OpeningStyle {
    BoldHook = 'bold_hook',
    ShockingStat = 'shocking_stat',
    PersonalStory = 'personal_story',
    RelatableQuestion = 'relatable_question',
    JumpIntoContent = 'jump_into_content',
}

export const openingStyleOptions = Object.values(OpeningStyle);

export const openingStyleToFrenchTranslation: Record<OpeningStyle, string> = {
    [OpeningStyle.BoldHook]: "Accroche audacieuse",
    [OpeningStyle.ShockingStat]: "Statistique choc",
    [OpeningStyle.PersonalStory]: "Histoire personnelle",
    [OpeningStyle.RelatableQuestion]: "Question relatable",
    [OpeningStyle.JumpIntoContent]: "Direct dans le contenu",
}
