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
    [Color.Red]: "bg-red/10",
    [Color.Blue]: "bg-blue/10",
    [Color.Purple]: "bg-purple/10",
    [Color.Yellow]: "bg-yellow/10",
    [Color.Green]: "bg-green/10",
}

export const colorToBorderClass: Record<Color, string> = {
    [Color.Red]: "border border-red/30",
    [Color.Blue]: "border border-blue/30",
    [Color.Purple]: "border border-purple/30",
    [Color.Yellow]: "border border-yellow/30",
    [Color.Green]: "border border-green/30",
}

export const colorOptions = Object.values(Color);
