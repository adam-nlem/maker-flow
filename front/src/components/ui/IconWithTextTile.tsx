import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface IconWithTextTileProps {
    icon: HeroIcon;
    label: string;
    isBold?: boolean;
    isSelected?: boolean;
    activeBgClassName?: string;
    activeBorderClassName?: string;
    className?: string;
    onClick?: () => void;
}

export default function IconWithTextTile({
    icon: Icon,
    label,
    isBold = false,
    isSelected = false,
    activeBgClassName = "bg-primary/10",
    activeBorderClassName = "border border-primary/30",
    className = "",
    onClick,
}: IconWithTextTileProps) {
    return (
        <div
            className={`flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2 ${isSelected ? `${activeBgClassName} ${activeBorderClassName}` : 'hover:bg-surface-hover border border-transparent'} ${className}`}
            onClick={onClick}
        >
            <Icon
                className={`size-5 shrink-0 ${isSelected ? 'text-dark' : 'text-gray'}`}
                strokeWidth={isBold ? 2 : 1}
            />
            <h1 className={`${isBold ? 'text-heading-sm' : 'text-body-sm'} whitespace-nowrap ${isSelected ? 'text-dark' : 'text-gray'}`}>
                {label}
            </h1>
        </div>
    );
}
