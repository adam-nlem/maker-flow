import Pill from "~/components/ui/Pill"
import type { Platform } from "~/models/enums/Platform"
import { platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform"

interface PlatformPillProps {
    platform: Platform
    isSelected: boolean
    onToggle: () => void
}

export default function PlatformPill({ platform, isSelected, onToggle }: PlatformPillProps) {
    return (
        <Pill
            imageUrl={platformToIcon[platform]}
            label={platformToFrenchTranslation[platform]}
            isSelected={isSelected}
            onClick={onToggle}
            borderColorClassName="border-light-gray"
        />
    )
}
