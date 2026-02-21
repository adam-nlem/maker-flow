export enum ShotType {
    ARoll = 'a_roll',
    BRoll = 'b_roll',
}

export const shotTypeToLabel: Record<ShotType, string> = {
    [ShotType.ARoll]: "A-Roll",
    [ShotType.BRoll]: "B-Roll",
}

export const shotTypeToBgClass: Record<ShotType, string> = {
    [ShotType.ARoll]: "bg-primary/30",
    [ShotType.BRoll]: "bg-gray/30",
}

export const shotTypeToTextClass: Record<ShotType, string> = {
    [ShotType.ARoll]: "text-primary",
    [ShotType.BRoll]: "text-gray",
}
