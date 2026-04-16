import { useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import type { HookTemplate } from "~/models/HookTemplate";
import { parseHookPlaceholders } from "~/utils/hookPlaceholderParser";
import Pill from "~/components/ui/Pill";
import { useDeleteHookTemplate } from "~/hooks/api/hookTemplates/useDeleteHookTemplate";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface HookTemplateCardProps {
    template: HookTemplate;
    isSelected?: boolean;
    onClick: () => void;
}

export default function HookTemplateCard({ template, isSelected = false, onClick }: HookTemplateCardProps) {
    const parts = parseHookPlaceholders(template.content);
    const { deleteHookTemplate, isPending: isDeleting } = useDeleteHookTemplate();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            <div
                onClick={onClick}
                className={`group relative w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer flex flex-col gap-1 ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-hover border border-transparent"}`}
            >
                <span className="text-heading-sm truncate pr-5">{template.title}</span>
                <span className="text-body-xs text-gray line-clamp-2 flex flex-wrap items-center gap-1">
                    {parts.map((part, index) =>
                        part.type === 'placeholder' ? (
                            <Pill key={index} label={part.label} isSelected bgColorClassName="bg-purple/10" borderColorClassName="border-primary/30" textColorClassName="text-primary" />
                        ) : (
                            <span key={index}>{part.value}</span>
                        )
                    )}
                </span>

                <button
                    onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                    disabled={isDeleting}
                    className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-danger cursor-pointer"
                >
                    <TrashIcon className="size-3.5" strokeWidth={2} />
                </button>
            </div>

            <ConfirmDeleteDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => deleteHookTemplate(template.uuid)}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible."
            />
        </>
    );
}
