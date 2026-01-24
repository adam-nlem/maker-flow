import { ChartBarSquareIcon, CalendarDaysIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import type { Integration } from "~/models/Integration"
import SelectDropdown from "~/components/ui/SelectDropdown"
import { useSocialAnalyticsFilterStore } from "../stores/socialAnalyticsFilterStore"
import { socialAnalyticsIntegrationInsightTypeOptions, SocialAnalyticsIntegrationInsightType, socialAnalyticsIntegrationInsightTypeToFrenchTranslation } from "../models/enums/SocialAnalyticsIntegrationInsightType"
import FilterTile from "./FilterTile"
import SocialAnalyticsIntegrationCard from "./integrations/SocialAnalyticsIntegrationCard"
import { integrationProviderTypeOptions } from "~/models/enums/IntegrationProvider"
import CreateSocialAnalyticsIntegrationCard from "./integrations/CreateSocialAnalyticsIntegrationCard"

interface SocialAnalyticsDashboardContentProps {
    userModuleUuid: string
    integrations: Integration[]
}

export default function SocialAnalyticsDashboardContent({
    userModuleUuid,
    integrations,
}: SocialAnalyticsDashboardContentProps) {
    const { integrationInsightType, setIntegrationInsightType } = useSocialAnalyticsFilterStore()

    return (
        <div className="p-5 w-2/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <SelectDropdown<SocialAnalyticsIntegrationInsightType>
                    items={socialAnalyticsIntegrationInsightTypeOptions}
                    selectedItemId={integrationInsightType}
                    getItemId={(item) => item}
                    onSelect={(item) => setIntegrationInsightType(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={ChartBarSquareIcon}
                            label={socialAnalyticsIntegrationInsightTypeToFrenchTranslation[integrationInsightType]}
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

            <div className="flex flex-row justify-between gap-3">
                {integrations.map((integration) => (
                    <SocialAnalyticsIntegrationCard
                        key={integration.uuid}
                        integration={integration}
                        insightType={integrationInsightType}
                    />
                ))}

                {integrationProviderTypeOptions.map((integrationProviderType) => {
                    if (integrations.find((integration) => integration.provider !== integrationProviderType)) {
                        return <CreateSocialAnalyticsIntegrationCard
                            key={integrationProviderType}
                            userModuleUuid={userModuleUuid}
                            provider={integrationProviderType}
                        />;
                    }

                })}

            </div>

        </div >
    )
}
