import type { ComponentType, ReactNode, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface FilterTileProps {
    label: string;
    icon?: HeroIcon;
    isSelected?: boolean;
    rightIcon?: ReactNode;
    onClick?: () => void;
}

export default function FilterTile({
    label,
    isSelected = false,
    icon: Icon,
    rightIcon,
    onClick
}: FilterTileProps) {
    return (
        <div
            className="flex flex-row justify-between gap-3 items-center hover:bg-light-gray cursor-pointer rounded-md p-2"
            onClick={onClick}
        >
            <div className="flex flex-row gap-3 items-center">
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary"></div>}
                {Icon && <Icon className="size-5 text-dark" strokeWidth={2} />}
                <h1 className="text-heading-sm whitespace-nowrap">{label}</h1>
            </div>
            {rightIcon}
        </div>
    );
}
