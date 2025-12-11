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
    [Color.Red]: "text-red-300",
    [Color.Blue]: "text-blue-300",
    [Color.Purple]: "text-purple-300",
    [Color.Yellow]: "text-yellow-300",
    [Color.Green]: "text-green-300",
}

export const colorToBgClass: Record<Color, string> = {
    [Color.Red]: "bg-red-300/30",
    [Color.Blue]: "bg-blue-300/30",
    [Color.Purple]: "bg-purple-300/30",
    [Color.Yellow]: "bg-yellow-300/30",
    [Color.Green]: "bg-green-300/30",
}
