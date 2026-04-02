import { useEffect, useMemo } from "react"
import Pill from "~/components/ui/Pill"
import PlatformPill from "~/components/ui/PlatformPill"
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations"
import { IntegrationStatus } from "~/models/enums/IntegrationStatus"
import { Platform } from "~/models/enums/Platform"

interface ContentPlatformFilterProps {
    projectUuid: string
    platformFilter: Platform | null
    onPlatformChange: (platform: Platform | null) => void
}

export default function ContentPlatformFilter({ projectUuid, platformFilter, onPlatformChange }: ContentPlatformFilterProps) {
    const { integrations } = useListIntegrations({ projectUuid })

    const activePlatforms = useMemo(() => {
        const platforms = integrations
            .filter((i) => i.status === IntegrationStatus.Active)
            .map((i) => i.platform)
        return [...new Set(platforms)]
    }, [integrations])

    useEffect(() => {
        if (activePlatforms.length <= 1 && platformFilter !== null) {
            onPlatformChange(null)
        }
    }, [activePlatforms, platformFilter, onPlatformChange])

    if (activePlatforms.length <= 1) return null

    return (
        <div className="flex flex-row items-center gap-2">
            <Pill
                label="Toutes les plateformes"
                isSelected={platformFilter === null}
                onClick={() => onPlatformChange(null)}
                bgColorClassName="bg-primary/10"
                borderColorClassName="border-primary/30"
                textColorClassName="text-primary"
            />
            {activePlatforms.map((platform) => (
                <PlatformPill
                    key={platform}
                    platform={platform}
                    isSelected={platformFilter === platform}
                    onToggle={() => onPlatformChange(platformFilter === platform ? null : platform)}
                />
            ))}
        </div>
    )
}
