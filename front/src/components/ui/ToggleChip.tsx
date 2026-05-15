import { CheckBadgeIcon } from "@heroicons/react/24/solid";

interface ToggleChipProps {
    label: string;
    isSelected: boolean;
    onToggle: () => void;
}

export function ToggleChip({ label, isSelected, onToggle }: ToggleChipProps) {
    return (
        <span
            onClick={onToggle}
            className={`px-3 py-1 border ${isSelected
                ? 'bg-primary text-white text-heading-xs'
                : 'text-body-xs border-pale-gray hover:bg-pale-gray-2'
                }  rounded-full cursor-pointer whitespace-nowrap transition-colors
                flex flex-row gap-1
                `}
        >
            {label}

            {isSelected && <CheckBadgeIcon className="size-4 text-white" strokeWidth={2.5} />}
        </span>
    );
}
