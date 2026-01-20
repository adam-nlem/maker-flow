import { ChartBarSquareIcon, CalendarDaysIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import type { Integration } from "~/models/Integration"
import SelectDropdown from "~/components/ui/SelectDropdown"
import { useSocialAnalyticsFilterStore } from "../stores/socialAnalyticsFilterStore"
import { SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../models/enums/SocialAnalyticsIntegrationInsightType"
import FilterTile from "./FilterTile"
import IntegrationTile from "./IntegrationTile"

interface SocialAnalyticsDashboardContentProps {
    userModuleUuid: string
    integrations: Integration[]
}

const insightTypeOptions = Object.values(SocialAnalyticsIntegrationInsightType)

export default function SocialAnalyticsDashboardContent({
    userModuleUuid,
    integrations,
}: SocialAnalyticsDashboardContentProps) {
    const { insightType, setInsightType } = useSocialAnalyticsFilterStore()

    return (
        <div className="p-5 w-2/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <SelectDropdown<SocialAnalyticsIntegrationInsightType>
                    items={insightTypeOptions}
                    selectedItemId={insightType}
                    getItemId={(item) => item}
                    onSelect={(item) => setInsightType(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={ChartBarSquareIcon}
                            label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[insightType]}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <FilterTile
                            label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[item]}
                            isSelected={isSelected}
                            onClick={onSelect}
                        />
                    )}
                />
            </div>


            {integrations.map((integration) => (
                <IntegrationTile
                    key={integration.uuid}
                    integration={integration}

                    insightType={insightType}
                />
            ))}

        </div>
    )
}
