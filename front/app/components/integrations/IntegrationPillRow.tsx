import { RectangleStackIcon } from "@heroicons/react/24/outline"
import Pill from "~/components/ui/Pill"
import type { Integration } from "~/models/Integration"
import { platformToFrenchTranslation, platformToIcon } from "~/models/enums/Platform"
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore"

interface IntegrationPillRowProps {
    integrations: Integration[]
}

export default function IntegrationPillRow({ integrations }: IntegrationPillRowProps) {
    const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid)
    const setFocusedIntegrationUuid = useFocusIntegrationStore((state) => state.setFocusedIntegrationUuid)

    return (
        <div className="flex flex-row flex-wrap gap-3">
            {integrations.map((integration) => (
                <Pill
                    key={integration.uuid}
                    imageUrl={platformToIcon[integration.platform]}
                    label={platformToFrenchTranslation[integration.platform]}
                    isSelected={integration.uuid === focusedIntegrationUuid}
                    onClick={() => setFocusedIntegrationUuid(integration.uuid)}
                    borderColorClassName="border-light-gray"
                />
            ))}
            <Pill
                icon={RectangleStackIcon}
                label="Toutes les plateformes"
                isSelected={focusedIntegrationUuid === null}
                onClick={() => setFocusedIntegrationUuid(null)}
                borderColorClassName="border-light-gray"
            />
        </div>
    )
}
