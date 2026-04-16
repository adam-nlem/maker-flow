import { useState } from "react";
import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import {
    ScriptStatusGroup,
    scriptStatusGroupToBgFullClass,
    scriptStatusGroupToFrenchTranslation,
} from "~/models/enums/ScriptStatusGroup";
import HomeScriptTile from "./HomeScriptTile";

interface HomeScriptsPanelSectionProps {
    group: ScriptStatusGroup;
    scripts: Script[];
    defaultOpen: boolean;
    onTileClick: (script: Script) => void;
}

export default function HomeScriptsPanelSection({ group, scripts, defaultOpen, onTileClick }: HomeScriptsPanelSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const ChevronIcon = isOpen ? ChevronDownIcon : ChevronRightIcon;

    return (
        <div className="flex flex-col border-b border-light-gray last:border-b-0">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex flex-row items-center gap-2 px-4 py-2 hover:bg-surface-hover transition-colors cursor-pointer"
            >
                <div className={`size-2 rounded-full ${scriptStatusGroupToBgFullClass[group]}`} />
                <span className="text-heading-sm">{scriptStatusGroupToFrenchTranslation[group]}</span>
                <span className="text-body-xs text-gray">{scripts.length}</span>
                <ChevronIcon className="size-4 text-gray ml-auto" strokeWidth={2} />
            </button>
            {isOpen && (
                scripts.length === 0 ? (
                    <p className="text-body-xs text-gray px-4 pb-3">Aucun script dans cette catégorie.</p>
                ) : (
                    <div className="flex flex-col pb-2 px-2">
                        {scripts.map((script) => (
                            <HomeScriptTile
                                key={script.uuid}
                                script={script}
                                onClick={() => onTileClick(script)}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}
