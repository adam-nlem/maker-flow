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
    [CallToActionType.Subscribe]: "bg-orange/10",
    [CallToActionType.Like]: "bg-pink/10",
    [CallToActionType.Comment]: "bg-blue/10",
    [CallToActionType.Share]: "bg-primary/10",
    [CallToActionType.Link]: "bg-purple/10",
    [CallToActionType.Custom]: "bg-gray/10",
}

export const callToActionTypeToBorderClass: Record<CallToActionType, string> = {
    [CallToActionType.Subscribe]: "border border-orange/30",
    [CallToActionType.Like]: "border border-pink/30",
    [CallToActionType.Comment]: "border border-blue/30",
    [CallToActionType.Share]: "border border-primary/30",
    [CallToActionType.Link]: "border border-purple/30",
    [CallToActionType.Custom]: "border border-gray/30",
}

export const callToActionTypeToTextClass: Record<CallToActionType, string> = {
    [CallToActionType.Subscribe]: "text-orange",
    [CallToActionType.Like]: "text-pink",
    [CallToActionType.Comment]: "text-blue",
    [CallToActionType.Share]: "text-primary",
    [CallToActionType.Link]: "text-purple",
    [CallToActionType.Custom]: "text-gray",
}
