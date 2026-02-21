export function Pill({ text, color, className = "" }: { 
    text: React.ReactNode, 
    color: string, 
    className?: string 
}) {
    return (
        <div className={`min-w-fit h-min px-2 py-0.5 rounded-md flex items-center justify-center ${color} ${className}`}>
            <span className="text-heading-sm clearspace-nowrap">{text}</span>
        </div>
    )
}
