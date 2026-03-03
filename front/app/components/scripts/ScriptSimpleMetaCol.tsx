import type { Script } from "~/models/Script";
import type { Platform } from "~/models/enums/Platform";
import { platformToIcon } from "~/models/enums/Platform";
import { colorToBgClass } from "~/models/enums/Color";

function PlatformIcon({ platform }: { platform: Platform }) {
    return (
        <img
            src={platformToIcon[platform]}
            alt={platform}
            className="size-3.5 rounded-md object-cover"
        />
    );
}

interface ScriptSimpleMetaColumnProps {
    script: Script;
}

export default function ScriptSimpleMetaColumn({ script }: ScriptSimpleMetaColumnProps) {
    return (
        <div className="flex flex-col gap-1.5">
            {script.platforms.length > 0 && (
                <div className="flex flex-row flex-wrap gap-1">
                    {script.platforms.map((platform) => (
                        <PlatformIcon key={platform} platform={platform} />
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
        </div>
    );
}
