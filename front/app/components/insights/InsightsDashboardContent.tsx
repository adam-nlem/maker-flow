import { ChartBarSquareIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import type { Integration } from "~/models/Integration"
import { IntegrationStatus } from "~/models/enums/IntegrationStatus"
import SelectDropdown from "~/components/ui/SelectDropdown"
import { useInsightsFilterStore } from "~/stores/insightsFilterStore"
import { integrationInsightTypeOptions, IntegrationInsightType, integrationInsightTypeToFrenchTranslation } from "~/models/enums/IntegrationInsightType"
import FilterTile from "./FilterTile"
import IntegrationCard from "./integrations/IntegrationCard"
import { platformOptions } from "~/models/enums/Platform"
import CreateIntegrationCard from "./integrations/CreateIntegrationCard"

interface InsightsDashboardContentProps {
    projectUuid: string
    integrations: Integration[]
}

export default function InsightsDashboardContent({
    projectUuid,
    integrations,
}: InsightsDashboardContentProps) {
    const { integrationInsightType, setIntegrationInsightType } = useInsightsFilterStore()

    return (
        <div className="p-5 w-2/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <SelectDropdown<IntegrationInsightType>
                    items={integrationInsightTypeOptions}
                    selectedItemId={integrationInsightType}
                    getItemId={(item) => item}
                    onSelect={(item) => setIntegrationInsightType(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={ChartBarSquareIcon}
                            label={integrationInsightTypeToFrenchTranslation[integrationInsightType]}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <FilterTile
                            label={integrationInsightTypeToFrenchTranslation[item]}
                            isSelected={isSelected}
                            onClick={onSelect}
                        />
                    )}
                />
            </div>

            <div className="flex flex-row justify-between gap-3">
                {platformOptions.map((platformType) => {
                    const integration = integrations.find((i) => i.platform === platformType)

                    if (!integration || integration.status !== IntegrationStatus.Active) {
                        return <CreateIntegrationCard
                            key={platformType}
                            projectUuid={projectUuid}
                            platform={platformType}
                        />
                    }

                    return <IntegrationCard
                        key={integration.uuid}
                        integration={integration}
                        insightType={integrationInsightType}
                    />
                })}
            </div>

        </div >
    )
}
