export function Pill({ text, color, className = "" }: { 
    text: React.ReactNode, 
    color: string, 
    className?: string 
}) {
    return (
        <div className={`w-min h-min px-2 py-0.5 rounded-md flex items-center justify-center ${color} ${className}`}>
            <span className="text-heading-sm text-clear clearspace-nowrap">{text}</span>
        </div>
    )
}
