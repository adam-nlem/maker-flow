import { useState, useRef, useEffect } from "react";
import { parseHookPlaceholders } from "~/helpers/hookPlaceholderParser";
import Pill from "~/components/ui/Pill";
import { Input } from "~/components/ui/Input";

interface HookContentRendererProps {
    content: string;
    onReplacePlaceholder: (placeholder: string, value: string) => void;
}

export default function HookContentRenderer({ content, onReplacePlaceholder }: HookContentRendererProps) {
    const [activePlaceholder, setActivePlaceholder] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const parts = parseHookPlaceholders(content);

    useEffect(() => {
        if (activePlaceholder && inputRef.current) {
            inputRef.current.focus();
        }
    }, [activePlaceholder]);

    const handlePillClick = (placeholderKey: string) => {
        setActivePlaceholder(placeholderKey);
        setInputValue("");
    };

    const handleConfirm = () => {
        if (activePlaceholder && inputValue.trim().length > 0) {
            onReplacePlaceholder(activePlaceholder, inputValue.trim());
        }
        setActivePlaceholder(null);
        setInputValue("");
    };

    const handleCancel = () => {
        setActivePlaceholder(null);
        setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleConfirm();
        } else if (e.key === "Escape") {
            handleCancel();
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-1 text-sm text-dark">
            {parts.map((part, index) =>
                part.type === 'placeholder' ? (
                    <div key={index} className="relative inline-flex">
                        <Pill
                            label={part.label}
                            isSelected
                            onClick={() => handlePillClick(part.value)}
                            bgColorClassName="bg-primary/10 border border-primary/30"
                            textColorClassName="text-primary"
                        />

                        {activePlaceholder === part.value && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={handleCancel} />
                                <div className="absolute top-full left-0 mt-1 z-30 border rounded-xl border-light-gray w-48 p-2 shadow-lg bg-clear">
                                    <Input
                                        ref={inputRef}
                                        simple
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onBlur={handleConfirm}
                                        onKeyDown={handleKeyDown}
                                        placeholder={part.label}
                                        textStyle="text-body-sm"
                                        fullWidth
                                    />
                                </div>
                            </>
                        )}
                    </div>
                ) : (
                    <span key={index}>{part.value}</span>
                )
            )}
        </div>
    );
}
