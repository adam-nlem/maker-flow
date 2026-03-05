import { useEffect, useRef, useState } from "react";
import type { Script } from "~/models/Script";
import { Platform, platformOptions, platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform";
import Pill from "~/components/ui/Pill";
import { useUpdateScript } from "~/hooks/api/scripts/useUpdateScript";

function PlatformPill({ platform, isSelected, onToggle }: { platform: Platform; isSelected: boolean; onToggle: () => void }) {
    return (
        <Pill
            imageUrl={platformToIcon[platform]}
            label={platformToFrenchTranslation[platform]}
            isSelected={isSelected}
            onClick={onToggle}
            borderColorClassName="border-light-gray"
        />
    );
}

interface Props {
    script: Script;
    isReadOnly?: boolean;
}

export default function ScriptPlatformsRow({ script, isReadOnly }: Props) {
    const { updateScript } = useUpdateScript();
    const [localPlatforms, setLocalPlatforms] = useState<Platform[]>(script.platforms);
    const pendingMutations = useRef(0);

    useEffect(() => {
        if (pendingMutations.current === 0) {
            setLocalPlatforms(script.platforms);
        }
    }, [script.platforms]);

    const handleToggle = async (platform: Platform) => {
        if (isReadOnly) return;
        const assignedPlatforms = new Set(localPlatforms);
        const newPlatforms = assignedPlatforms.has(platform)
            ? localPlatforms.filter((p) => p !== platform)
            : [...localPlatforms, platform];

        const previousPlatforms = localPlatforms;
        setLocalPlatforms(newPlatforms);
        pendingMutations.current++;

        try {
            await updateScript({ scriptUuid: script.uuid, data: { platforms: newPlatforms } });
        } catch {
            setLocalPlatforms(previousPlatforms);
        } finally {
            pendingMutations.current--;
        }
    };

    const assignedPlatforms = new Set(localPlatforms);

    return (
        <div className="flex flex-row items-center gap-2">
            {platformOptions.map((platform) => (
                <PlatformPill
                    key={platform}
                    platform={platform}
                    isSelected={assignedPlatforms.has(platform)}
                    onToggle={() => handleToggle(platform)}
                />
            ))}
        </div>
    );
}
