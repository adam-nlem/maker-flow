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
    isSelected = false,
    className = "",
    onClick,
}: IconWithTextTileProps) {
    return (
        <div
            className={`${isSelected ? 'text-primary' : 'text-dark-2'} flex flex-row items-center gap-3 cursor-pointer rounded-lg p-2  hover:bg-surface-hover border border-transparent ${className}`}
            onClick={onClick}
        >
            <Icon
                className={"size-5 shrink-0"}
                strokeWidth={1.5}
            />
            <h1 className={`${isSelected ? 'text-heading-xs' : 'text-body-xs'} whitespace-nowrap `}>
                {label}
            </h1>
        </div>
    );
}
