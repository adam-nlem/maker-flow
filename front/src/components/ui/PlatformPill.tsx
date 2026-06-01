import { useTranslation } from "react-i18next"
import Pill from "~/components/ui/Pill"
import type { Platform } from "~/models/enums/Platform"
import { platformTranslationKeys, platformToIcon } from "~/models/enums/Platform"

interface PlatformPillProps {
    platform: Platform
    isSelected?: boolean
    onToggle?: () => void
}

export default function PlatformPill({ platform, isSelected, onToggle }: PlatformPillProps) {
    const { t } = useTranslation()
    return (
        <Pill
            imageUrl={platformToIcon[platform]}
            label={t(platformTranslationKeys[platform])}
            isSelected={onToggle ? isSelected : true}
            onClick={onToggle}
            borderColorClassName="border-pale-gray"
            bgColorClassName="bg-clear"
        />
    )
}
