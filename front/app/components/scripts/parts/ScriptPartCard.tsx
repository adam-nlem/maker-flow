import { useState } from "react";
import type { ScriptPartType } from "~/models/enums/ScriptPartType";
import { scriptPartTypeToIcon, scriptPartTypeToFrenchTranslation, scriptPartTypeToBgClass, scriptPartTypeToBorderClass } from "~/models/enums/ScriptPartType";
import Pill from "~/components/ui/Pill";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ScriptPartCardProps {
    partType: ScriptPartType;
    dragHandleProps?: Record<string, unknown>;
    bordered?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    headerActions?: React.ReactNode;
    children: React.ReactNode;
}

export default function ScriptPartCard({
    partType,
    dragHandleProps,
    bordered = true,
    onDelete,
    isDeleting,
    headerActions,
    children,
}: ScriptPartCardProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div
            {...dragHandleProps}
            className={`cursor-grab group flex flex-col gap-2 p-4 ${bordered ? `border ${scriptPartTypeToBorderClass[partType]} rounded-xl bg-clear` : ""}`}
        >

            <div className="grid transition-all duration-200">
                <div className="overflow-hidden">
                    <div className="flex flex-row justify-between">
                        <Pill
                            icon={scriptPartTypeToIcon[partType]}
                            isSelected
                            label={scriptPartTypeToFrenchTranslation[partType]}
                            bgColorClassName={scriptPartTypeToBgClass[partType]}
                            borderColorClassName={scriptPartTypeToBorderClass[partType]}
                        />
                        <div className="flex items-center gap-1">
                            {headerActions}
                            {onDelete && (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className={`hover:text-danger text-xs cursor-pointer transition opacity-0 group-hover:opacity-100 ${isDeleting ? "pointer-events-none opacity-40" : ""}`}
                                >
                                    <XMarkIcon className="size-4" strokeWidth={2} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {children}

            <ConfirmDeleteDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={onDelete!}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible."
            />
        </div>
    );
}
