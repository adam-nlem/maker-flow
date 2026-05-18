import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface TagProps {
    label: string;
    icon?: HeroIcon;
    bgClassName?: string;
    textClassName?: string;
    className?: string;
}

export function Tag({ label, icon: Icon, bgClassName = "bg-pale-gray-2", textClassName = "text-muted-2", className = "" }: TagProps) {
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-body-xs ${bgClassName} ${textClassName} ${className}`}>
            {Icon && <Icon className="size-3.5" strokeWidth={2} />}
            {label}
        </span>
    );
}
