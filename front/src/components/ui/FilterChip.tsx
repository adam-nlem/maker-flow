interface FilterChipProps {
    label: string;
    isSelected: boolean;
    onClick: () => void;
}

export default function FilterChip({ label, isSelected, onClick }: FilterChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center h-6 px-2.5 rounded-full border text-xs transition-colors cursor-pointer ${
                isSelected
                    ? "bg-dark text-clear border-dark"
                    : "border-pale-gray text-muted hover:bg-clear-2"
            }`}
        >
            {label}
        </button>
    );
}
