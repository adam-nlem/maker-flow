import { XMarkIcon } from "@heroicons/react/16/solid";
import { AdjustmentsHorizontalIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface BadgeProps {
    icon: HeroIcon;
    label: string;
    textColor?: string;
    bgColor?: string;
    onClick?: () => void;
    onOptionClick?: () => void;
    onRemoveClick?: () => void;
}

export function Badge({ icon: Icon, label, textColor = "text-gray", bgColor, onClick, onOptionClick, onRemoveClick }: BadgeProps) {
    return (
        <div className="group flex flex-row justify-between">
            <div
                onClick={onClick}
                className={`cursor-pointer flex flex-row gap-1 min-w-fit items-center ${textColor} ${bgColor ? `px-1.5 rounded-xl ${bgColor}` : ''}`}>
                <Icon className="size-3" strokeWidth={2} />
                <p className="text-xs">{label}</p>
            </div>
            {(onOptionClick || onRemoveClick) && (
                <div className="flex flex-row gap-1 min-w-fit ml-3 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {onOptionClick && <EllipsisHorizontalIcon className="size-4 cursor-pointer text-gray hover:text-dark" strokeWidth={2} onClick={onOptionClick} />}
                    {onRemoveClick && <XMarkIcon className="size-3.5 text-danger hover:text-dark cursor-pointer" strokeWidth={2} onClick={onRemoveClick} />}
                </div>
            )}
        </div>
    );
}
