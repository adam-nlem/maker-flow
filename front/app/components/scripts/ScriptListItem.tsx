import { TrashIcon } from "@heroicons/react/24/outline";
import type { Script } from "~/models/Script";
import { colorToBgClass } from "~/models/enums/Color";
import { useDeleteScript } from "~/hooks/api/scripts/useDeleteScript";
import type { Platform } from "~/models/enums/Platform";
import { useShowPlatformIcon } from "~/hooks/api/integrations/useShowPlatformIcon";

function PlatformIcon({ platform, }: { platform: Platform; }) {
    const { iconUrl } = useShowPlatformIcon(platform);

    if (!iconUrl) return null;

    return (
        <img
            src={iconUrl}
            alt={platform}
            className={"size-3.5 rounded-md object-cover"}
        />
    );
}

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

            {script.platforms.length > 0 && (
                <div className="flex flex-row flex-wrap gap-1">
                    {script.platforms.map((platform) => (
                        <PlatformIcon platform={platform} />
                    ))}
                </div>
            )}

            {script.tags.length > 0 && (
                <div className="flex flex-row flex-wrap gap-1">
                    {script.tags.map((tag) => (
                        <div
                            key={tag.uuid}
                            className={`w-2.5 h-2.5 rounded-full ${colorToBgClass[tag.color]}`}
                        />
                    ))}
                </div>
            )}


            {script.publishedAt && (
                <p className="text-body-xs text-gray">
                    {script.publishedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                </p>
            )}

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
