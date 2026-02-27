export enum CallToActionType {
    Subscribe = 'subscribe',
    Like = 'like',
    Comment = 'comment',
    Share = 'share',
    Link = 'link',
    Custom = 'custom',
}

export const callToActionTypeOptions = Object.values(CallToActionType);

export const callToActionTypeToFrenchTranslation: Record<CallToActionType, string> = {
    [CallToActionType.Subscribe]: "S'abonner",
    [CallToActionType.Like]: "Liker",
    [CallToActionType.Comment]: "Commenter",
    [CallToActionType.Share]: "Partager",
    [CallToActionType.Link]: "Lien",
    [CallToActionType.Custom]: "Personnalisé",
}

export const callToActionTypeToBgClass: Record<CallToActionType, string> = {
    [CallToActionType.Subscribe]: "bg-orange/30",
    [CallToActionType.Like]: "bg-pink/30",
    [CallToActionType.Comment]: "bg-blue/30",
    [CallToActionType.Share]: "bg-primary/30",
    [CallToActionType.Link]: "bg-purple/30",
    [CallToActionType.Custom]: "bg-gray/30",
}

export const callToActionTypeToTextClass: Record<CallToActionType, string> = {
    [CallToActionType.Subscribe]: "text-orange",
    [CallToActionType.Like]: "text-pink",
    [CallToActionType.Comment]: "text-blue",
    [CallToActionType.Share]: "text-primary",
    [CallToActionType.Link]: "text-purple",
    [CallToActionType.Custom]: "text-gray",
}
