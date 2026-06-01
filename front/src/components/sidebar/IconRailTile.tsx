import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface IconRailTileProps {
    icon: HeroIcon;
    label: string;
    isSelected?: boolean;
    onClick?: () => void;
}

export default function IconRailTile({ icon: Icon, label, isSelected = false, onClick }: IconRailTileProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className={`relative group size-9 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
                isSelected ? "bg-primary/10 text-primary" : "text-dark-2 hover:bg-surface-hover"
            }`}
        >
            <Icon className="size-5 shrink-0" strokeWidth={1.5} />
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-dark text-clear text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {label}
            </span>
        </button>
    );
}
