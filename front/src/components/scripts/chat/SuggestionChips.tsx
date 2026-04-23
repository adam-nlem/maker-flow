import Pill from "~/components/ui/Pill";

interface SuggestionChipsProps {
    suggestions: string[];
    onSelect: (suggestion: string) => void;
}

export default function SuggestionChips({ suggestions, onSelect }: SuggestionChipsProps) {
    if (suggestions.length === 0) return null;

    return (
        <div className="flex flex-row flex-wrap gap-2 justify-center">
            {suggestions.map((suggestion) => (
                <Pill
                    key={suggestion}
                    label={suggestion}
                    onClick={() => onSelect(suggestion)}
                />
            ))}
        </div>
    );
}
