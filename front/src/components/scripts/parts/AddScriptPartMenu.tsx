import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import ScriptPartTypeMenu from "./ScriptPartTypeMenu";

interface AddScriptPartMenuProps {
    scriptUuid: string;
    generationUuid?: string;
    hasHook: boolean;
}

export default function AddScriptPartMenu({ scriptUuid, generationUuid, hasHook }: AddScriptPartMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
                    <div className="absolute bottom-full left-0 mb-2 z-30">
                        <ScriptPartTypeMenu
                            scriptUuid={scriptUuid}
                            generationUuid={generationUuid}
                            hasHook={hasHook}
                            onPartCreated={() => setIsOpen(false)}
                        />
                    </div>
                </>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex flex-row items-center gap-2 px-4 py-2.5 border border-primary/30 rounded-xl bg-primary/10 hover:bg-surface-hover transition-colors text-primary hover:text-dark cursor-pointer w-full"
            >
                <PlusIcon className="size-4 shrink-0" strokeWidth={2} />
                <span className="text-heading-sm">Ajouter un élément</span>
            </button>
        </div>
    );
}
