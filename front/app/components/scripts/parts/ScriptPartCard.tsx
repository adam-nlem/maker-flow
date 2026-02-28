import type { ScriptPartType } from "~/models/enums/ScriptPartType";
import { scriptPartTypeToIcon, scriptPartTypeToFrenchTranslation, scriptPartTypeToBgClass, scriptPartTypeToBorderClass } from "~/models/enums/ScriptPartType";
import { useScriptEditorStore } from "~/stores/scripts/scriptEditorStore";
import Pill from "~/components/ui/Pill";
import { XMarkIcon } from "@heroicons/react/24/outline";

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
                        <button
                            onClick={onDelete}
                            className={`hover:text-danger text-xs cursor-pointer transition opacity-0 group-hover:opacity-100 ${isDeleting ? "pointer-events-none opacity-40" : ""}`}
                        >
                            <XMarkIcon className="size-4" strokeWidth={2} />
                        </button>
                    </div>
                </div>
            </div>

            {children}
        </div>
    );
}
