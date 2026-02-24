import type { ScriptPartType } from "~/models/enums/ScriptPartType";
import { scriptPartTypeToIcon, scriptPartTypeToFrenchTranslation, scriptPartTypeToBgClass } from "~/models/enums/ScriptPartType";
import { useScriptEditorStore } from "~/stores/scripts/scriptEditorStore";
import ScriptPartHeader from "./ScriptPartHeader";

interface ScriptPartCardProps {
    partType: ScriptPartType;
    dragHandleProps?: Record<string, unknown>;
    bordered?: boolean;
    onDelete?: () => void;
    isDeleting?: boolean;
    children: React.ReactNode;
}

export default function ScriptPartCard({
    partType,
    dragHandleProps,
    bordered = true,
    onDelete,
    isDeleting,
    children,
}: ScriptPartCardProps) {
    const isExpanded = useScriptEditorStore((s) => s.isExpanded);

    const header = (
        <ScriptPartHeader
            icon={scriptPartTypeToIcon[partType]}
            label={scriptPartTypeToFrenchTranslation[partType]}
            colorClassName={scriptPartTypeToBgClass[partType]}
        />
    );

    const deleteAction = onDelete && (
        <span
            onClick={onDelete}
            className={`hover:text-danger text-xs cursor-pointer transition opacity-0 group-hover:opacity-100 ${isDeleting ? "pointer-events-none opacity-40" : ""}`}
        >
            Supprimer
        </span>
    );

    return (
        <div
            {...dragHandleProps}
            className={`cursor-grab group flex flex-col gap-2 ${bordered ? "border border-light-gray rounded-xl p-4 bg-clear" : ""}`}
        >
            {isExpanded &&
                <div className={`grid transition-all duration-200 ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                        <div className="flex flex-col gap-1">
                            {header}
                            {deleteAction}
                        </div>
                    </div>
                </div>
            }
            {children}
        </div>
    );
}
