import { RectangleStackIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"
import Pill from "~/components/ui/Pill"
import type { Integration } from "~/models/Integration"
import { platformTranslationKeys, platformToIcon } from "~/models/enums/Platform"
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore"

interface IntegrationPillRowProps {
    integrations: Integration[]
    showAllOption?: boolean
}

export default function IntegrationPillRow({ integrations, showAllOption = true }: IntegrationPillRowProps) {
    const { t } = useTranslation()

    const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid)
    const setFocusedIntegrationUuid = useFocusIntegrationStore((state) => state.setFocusedIntegrationUuid)
    
    return (
        <div className="flex flex-row flex-wrap gap-3">
            {integrations.map((integration) => (
                <Pill
                    key={integration.uuid}
                    imageUrl={platformToIcon[integration.platform]}
                    label={t(platformTranslationKeys[integration.platform])}
                    isSelected={integration.uuid === focusedIntegrationUuid}
                    onClick={() => setFocusedIntegrationUuid(integration.uuid)}
                    borderColorClassName="border-light-gray"
                />
            ))}
            {showAllOption && (
                <Pill
                    icon={RectangleStackIcon}
                    label={t("integrations:allPlatforms")}
                    isSelected={focusedIntegrationUuid === null}
                    onClick={() => setFocusedIntegrationUuid(null)}
                    borderColorClassName="border-light-gray"
                />
            )}
        </div>
    )
}
