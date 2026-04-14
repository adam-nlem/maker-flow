import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface PillProps {
    icon?: HeroIcon;
    suffixIcon?: HeroIcon;
    imageUrl?: string;
    label?: string;
    isSelected?: boolean;
    onClick?: () => void;
    onSuffixClick?: () => void;
    bgColorClassName?: string;
    borderColorClassName?: string;
    textColorClassName?: string;
}

export default function Pill({ icon: Icon, suffixIcon: SuffixIcon, imageUrl, label, isSelected, onClick, onSuffixClick, bgColorClassName = "", borderColorClassName = "", textColorClassName = "text-dark" }: PillProps) {
    return (
        <div onClick={onClick} className={`max-w-fit flex flex-row items-center gap-1 px-1 py-0.5 rounded-md border ${isSelected ? `${bgColorClassName} ${borderColorClassName} ${textColorClassName}` : "border-dashed border-light-gray text-gray hover:border-gray hover:text-dark"}  transition-colors ${onClick && "cursor-pointer"}`}>
            {Icon && (
                <Icon
                    className={`size-3 shrink-0 ${isSelected ? textColorClassName : 'text-gray'}`}
                    strokeWidth={2.5}
                />
            )}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={label}
                    className={`size-5 rounded-md object-cover ${isSelected ? "opacity-100" : "grayscale opacity-40 hover:opacity-60"}`}
                />
            )}
            {label && <span className="text-heading-xs whitespace-nowrap">{label}</span>}
            {SuffixIcon && (
                <button
                    onClick={(e) => { e.stopPropagation(); onSuffixClick?.(); }}
                    className="hover:opacity-70 transition-opacity cursor-pointer"
                >
                    <SuffixIcon className="size-3 shrink-0" strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
}
