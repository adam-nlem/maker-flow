export enum ShotType {
    ARoll = 'a_roll',
    BRoll = 'b_roll',
}

export const shotTypeTranslationKeys: Record<ShotType, string> = {
    [ShotType.ARoll]: "enums:shotType.aRoll",
    [ShotType.BRoll]: "enums:shotType.bRoll",
}

export const shotTypeToBgClass: Record<ShotType, string> = {
    [ShotType.ARoll]: "bg-primary/10",
    [ShotType.BRoll]: "bg-muted-2/10",
}

export const shotTypeToBorderClass: Record<ShotType, string> = {
    [ShotType.ARoll]: "border border-primary/30",
    [ShotType.BRoll]: "border border-muted-2/30",
}

export const shotTypeToTextClass: Record<ShotType, string> = {
    [ShotType.ARoll]: "text-primary",
    [ShotType.BRoll]: "text-muted-2",
}

export const shotTypeOptions = Object.values(ShotType);
