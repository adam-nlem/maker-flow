import { platformToFrenchTranslation, type Platform } from "~/models/enums/Platform";
import { useShowPlatformIcon } from "~/hooks/api/integrations/useShowPlatformIcon";

interface PlatformIconToggleProps {
    platform: Platform;
    isSelected: boolean;
    onToggle: () => void;
}

export default function PlatformIconToggle({ platform, isSelected, onToggle }: PlatformIconToggleProps) {
    const { iconUrl } = useShowPlatformIcon(platform);

    if (!iconUrl) return null;

    return (


        <button
            onClick={onToggle}
            className={`min-w-fit flex flex-row items-center gap-1 px-2 py-0.5 rounded-md border ${isSelected ? "" : "border-dashed"} border-light-gray text-gray hover:border-gray hover:text-dark transition-colors cursor-pointer`}
        >
            <img
                src={iconUrl}
                alt={platform}
                className={`size-5 rounded-md object-cover ${isSelected ? "opacity-100" : "grayscale opacity-40 hover:opacity-60"}`}
            />
            <span className="text-heading-xs">{platformToFrenchTranslation[platform]}</span>
        </button>
    );
}
