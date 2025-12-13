// These colors are all the colors available for the user to pick from 
// to customize todo tags etc.

export enum Color {
    Red = 'red',
    Blue = 'blue',
    Purple = 'purple',
    Yellow = 'yellow',
    Green = 'green',
}

export const colorToTextClass: Record<Color, string> = {
    [Color.Red]: "text-red",
    [Color.Blue]: "text-blue",
    [Color.Purple]: "text-purple",
    [Color.Yellow]: "text-yellow",
    [Color.Green]: "text-green",
}

export const colorToBgClass: Record<Color, string> = {
    [Color.Red]: "bg-red/30",
    [Color.Blue]: "bg-blue/30",
    [Color.Purple]: "bg-purple/30",
    [Color.Yellow]: "bg-yellow/30",
    [Color.Green]: "bg-green/30",
}
