import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface BadgeProps {
    icon: HeroIcon;
    label: string;
    textColor?: string;
    bgColor?: string;
    onClick?: () => void;
}

export function Badge({ icon: Icon, label, textColor = "text-gray", bgColor, onClick }: BadgeProps) {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer flex flex-row gap-1 w-fit items-center ${textColor} ${bgColor ? `px-1.5 rounded-xl ${bgColor}` : ''}`}>
            <Icon className="size-3" strokeWidth={2} />
            <p className="text-xs">{label}</p>
        </div>
    );
}
