import type { ReactNode } from "react"

interface EyebrowLabelProps {
    children: ReactNode
}

export default function EyebrowLabel({ children }: EyebrowLabelProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="size-1.5 rounded-full bg-primary" />
            <span className="text-xs uppercase tracking-wider text-muted font-medium">
                {children}
            </span>
        </div>
    )
}
