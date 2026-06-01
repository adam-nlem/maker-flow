import { useDraggable } from "@dnd-kit/core";
import type { Script } from "~/models/Script";
import type { Platform } from "~/models/enums/Platform";
import { platformToIcon } from "~/models/enums/Platform";
import { colorToBgClass } from "~/models/enums/Color";
import Pill from "~/components/ui/Pill";
import { scriptStatusToBgClass, scriptStatusToIcon, scriptStatusToTextClass } from "~/models/enums/ScriptStatus";

function PlatformIcon({ platform }: { platform: Platform }) {
    return (
        <img
            src={platformToIcon[platform]}
            alt={platform}
            className="size-3 rounded-sm object-cover"
        />
    );
}

interface ScriptTileProps {
    script: Script;
    onClick: () => void;
    isDraggable?: boolean;
}

export default function ScriptTile({ script, onClick, isDraggable = true }: ScriptTileProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: script.uuid, data: { script }, disabled: !isDraggable });

    return (
        <div
            ref={setNodeRef}
            {...(isDraggable ? { ...listeners, ...attributes } : {})}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className={`px-1.5 max-h-fit py-1 border border-pale-gray rounded-md hover:bg-surface-hover cursor-pointer transition-colors gap-1 ${isDragging ? "opacity-40" : ""}`}
        >
            <p className="text-heading-xs truncate">{script.title}</p>

            {(script.platforms.length > 0 || script.tags.length > 0) && (
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row items-center gap-1">
                        {script.platforms.map((platform) => (
                            <PlatformIcon key={platform} platform={platform} />
                        ))}
                        {script.tags.map((tag) => (
                            <div
                                key={tag.uuid}
                                className={`w-2 h-2 rounded-full ${colorToBgClass[tag.color]}`}
                            />
                        ))}
                    </div>
                    {script.status && <Pill
                        icon={scriptStatusToIcon[script.status]}
                        isSelected
                        bgColorClassName={scriptStatusToBgClass[script.status]}
                        textColorClassName={scriptStatusToTextClass[script.status]}
                    />}
                </div>
            )}
        </div>
    );
}
