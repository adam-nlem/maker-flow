import type { HookTemplate } from "~/models/HookTemplate";
import { parseHookPlaceholders } from "~/helpers/hookPlaceholderParser";
import { Pill } from "~/components/ui/Pill";

interface HookTemplateCardProps {
    template: HookTemplate;
    isSelected?: boolean;
    onClick: () => void;
}

export default function HookTemplateCard({ template, isSelected = false, onClick }: HookTemplateCardProps) {
    const parts = parseHookPlaceholders(template.content);

    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex flex-col gap-1 ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-hover border border-transparent"}`}
        >
            <span className="text-heading-sm truncate">{template.title}</span>
            <span className="text-body-xs text-gray line-clamp-2 flex flex-wrap items-center gap-1">
                {parts.map((part, index) =>
                    part.type === 'placeholder' ? (
                        <Pill key={index} text={part.label} color="bg-purple/10 text-primary border border-primary-30" textStyle="text-heading-xs" />
                    ) : (
                        <span key={index}>{part.value}</span>
                    )
                )}
            </span>
        </button>
    );
}
