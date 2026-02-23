import { TrashIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { useDeleteScript } from "~/hooks/api/scripts/useDeleteScript";
import ScriptSimpleMetaColumn from "./ScriptSimpleMetaCol";

interface ScriptListItemProps {
    script: Script;
    isSelected: boolean;
    onClick: () => void;
}

export default function ScriptListItem({ script, isSelected, onClick }: ScriptListItemProps) {
    const { deleteScript, isPending: isDeleting } = useDeleteScript();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        deleteScript(script.uuid);
    };

    return (
        <div
            onClick={onClick}
            className={`group relative flex flex-col gap-1.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-surface-hover border border-transparent"}`}
        >
            <p className={`text-heading-sm truncate ${isSelected ? "text-primary" : ""}`}>{script.title}</p>

            <ScriptSimpleMetaColumn script={script} />

            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="absolute right-2  opacity-0 group-hover:opacity-100 transition-opacity text-gray hover:text-danger cursor-pointer"
            >
                <TrashIcon className="size-3.5" strokeWidth={2} />
            </button>

            
        </div>
    );
}
