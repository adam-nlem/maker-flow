export function Pill({ text, color, textStyle = "text-heading-sm", className = "" }: {
    text: React.ReactNode,
    color: string,
    textStyle?: string,
    className?: string
}) {
    return (
        <div className={`min-w-fit h-min px-2 py-0.5 rounded-md flex items-center justify-center ${color} ${className}`}>
            <span className={`${textStyle} clearspace-nowrap`}>{text}</span>
        </div>
    )
}
