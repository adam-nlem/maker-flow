import { useState } from "react";
import { TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { useDeleteScript } from "~/hooks/api/scripts/useDeleteScript";
import ScriptSimpleMetaColumn from "./ScriptSimpleMetaCol";
import ConfirmDeleteDialog from "~/components/ui/ConfirmDeleteDialog";

interface ScriptCardProps {
    script: Script;
    isSelected: boolean;
    onClick: () => void;
}

export default function ScriptCard({ script, isSelected, onClick }: ScriptCardProps) {
    const { deleteScript, isPending: isDeleting } = useDeleteScript();
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <>
            <div
                onClick={onClick}
                className={`group relative flex flex-col gap-1.5 p-3 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-hover border border-light-gray"}`}
            >
                <p className={`text-heading-sm truncate ${isSelected ? "text-primary" : ""}`}>{script.title}</p>

                <ScriptSimpleMetaColumn script={script} />

                <button
                    onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                    disabled={isDeleting}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-danger cursor-pointer"
                >
                    <XMarkIcon className="size-4" strokeWidth={2} />
                </button>
            </div>

            <ConfirmDeleteDialog
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={() => deleteScript(script.uuid)}
                isPending={isDeleting}
                message="Êtes-vous sûr de vouloir supprimer ce script ? Cette action est irréversible."
            />
        </>
    );
}
