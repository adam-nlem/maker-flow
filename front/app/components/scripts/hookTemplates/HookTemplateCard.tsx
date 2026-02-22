import { TrashIcon } from "@heroicons/react/24/outline";
import type { HookTemplate } from "~/models/HookTemplate";
import { parseHookPlaceholders } from "~/helpers/hookPlaceholderParser";
import { Pill } from "~/components/ui/Pill";
import { useDeleteHookTemplate } from "~/hooks/api/hookTemplates/useDeleteHookTemplate";

interface HookTemplateCardProps {
    template: HookTemplate;
    isSelected?: boolean;
    onClick: () => void;
}

export default function HookTemplateCard({ template, isSelected = false, onClick }: HookTemplateCardProps) {
    const parts = parseHookPlaceholders(template.content);
    const { deleteHookTemplate, isPending: isDeleting } = useDeleteHookTemplate();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteHookTemplate(template.uuid);
    };

    return (
        <div
            onClick={onClick}
            className={`group relative w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex flex-col gap-1 ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-hover border border-transparent"}`}
        >
            <span className="text-heading-sm truncate pr-5">{template.title}</span>
            <span className="text-body-xs text-gray line-clamp-2 flex flex-wrap items-center gap-1">
                {parts.map((part, index) =>
                    part.type === 'placeholder' ? (
                        <Pill key={index} text={part.label} color="bg-purple/10 text-primary border border-primary-30" textStyle="text-heading-xs" />
                    ) : (
                        <span key={index}>{part.value}</span>
                    )
                )}
            </span>

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-danger cursor-pointer"
            >
                <TrashIcon className="size-3.5" strokeWidth={2} />
            </button>
        </div>
    );
}
