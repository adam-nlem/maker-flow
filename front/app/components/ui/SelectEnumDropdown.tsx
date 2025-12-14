import { Badge } from "~/components/ui/Badge";
import type { ComponentType, SVGProps } from "react";

type HeroIcon = ComponentType<SVGProps<SVGSVGElement>>;

interface EnumConfig<T extends string> {
    icon: HeroIcon;
    label: string;
    textColor: string;
    bgColor: string;
    value: T;
}

interface SelectEnumDropdownProps<T extends string> {
    selectedValue?: T;
    options: EnumConfig<T>[];
    onClose: () => void;
    onSelect: (value: T) => void;
}

export default function SelectEnumDropdown<T extends string>({ 
    selectedValue, 
    options, 
    onClose, 
    onSelect 
}: SelectEnumDropdownProps<T>) {
    return (
        <>
            {/* Backdrop to close dropdown when clicking outside */}
            <div className="fixed inset-0 z-0" onClick={onClose} />
            <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-light-gray rounded-lg shadow-md min-w-max p-2 text-center">
                <div className="flex flex-col gap-1">
                    {options.map((option) => {
                        if (selectedValue !== option.value)
                            return (
                                <Badge
                                    key={option.value}
                                    icon={option.icon}
                                    label={option.label}
                                    textColor={option.textColor}
                                    bgColor={option.bgColor}
                                    onClick={() => onSelect(option.value)}
                                />
                            )
                    })}
                </div>
            </div>
        </>
    );
}
