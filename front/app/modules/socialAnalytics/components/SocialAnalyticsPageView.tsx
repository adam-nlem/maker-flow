import { CalendarDaysIcon, ChartBarSquareIcon, ChevronUpDownIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import IntegrationTile from "~/components/integrations/IntegrationTile";
import IconWithTextTile from "~/components/ui/IconWithTextTile";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import type { ModuleWidgetProps } from "~/modules/registry";
import { socialAnalyticsInsightTypeOptions, socialAnalyticsInsightTypeToFrenchTranslation, type SocialAnalyticsInsightType } from "../models/enums/SocialAnalyticsInsightType";
import { useSocialAnalyticsFilterStore } from "../stores/socialAnalyticsFilterStore";
import FilterTile from "./FilterTile";
import SocialAnalyticsIntegrationPageView from "./integrations/SocialAnalyticsIntegrationPageView";
import { SocialAnalyticsTimePeriod, socialAnalyticsTimePeriodOptions, socialAnalyticsTimePeriodToFrenchTranslation } from "../models/enums/SocialAnalyticsTimePeriod";

export default function SocialAnalyticsPageView({ userModuleUuid }: ModuleWidgetProps) {
    const { integrations, isLoading } = useListIntegrations({ userModuleUuid });

    const insightType = useSocialAnalyticsFilterStore((state) => state.insightType);
    const setInsightType = useSocialAnalyticsFilterStore((state) => state.setInsightType);

    const timePeriod = useSocialAnalyticsFilterStore((state) => state.timePeriod);
    const setTimePeriod = useSocialAnalyticsFilterStore((state) => state.setTimePeriod);

    const focusedIntegrationUuid = useSocialAnalyticsFilterStore((state) => state.focusedIntegrationUuid)
    const setFocusedIntegrationUuid = useSocialAnalyticsFilterStore((state) => state.setFocusedIntegrationUuid)

    const focusedIntegration = integrations.find((integration) => integration.uuid === focusedIntegrationUuid);
    const displayedIntegration = focusedIntegration ?? integrations[0];

    if (isLoading) {
        return null;
    }

    return <div className="p-5 flex flex-col gap-3">
        <div className="flex flex-row justify-between">
            <div className="flex flex-row flex-wrap gap-3">
                {integrations.map((integration) => (
                    <IntegrationTile integration={integration} isSelected={integration.uuid === focusedIntegrationUuid} onClick={() => setFocusedIntegrationUuid(integration.uuid)} />
                ))}

                <IconWithTextTile icon={RectangleStackIcon} label={"Toutes les plateformes"} isExpanded isBold isSelected={focusedIntegrationUuid === null} onClick={() => setFocusedIntegrationUuid(null)} />
            </div>
            <div className="flex flex-row flex-wrap gap-3">
                <SelectDropdown<SocialAnalyticsInsightType>
                    items={socialAnalyticsInsightTypeOptions}
                    selectedItemId={insightType}
                    getItemId={(item) => item}
                    onSelect={(item) => setInsightType(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={ChartBarSquareIcon}
                            label={socialAnalyticsInsightTypeToFrenchTranslation[insightType]}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <FilterTile
                            label={socialAnalyticsInsightTypeToFrenchTranslation[item]}
                            isSelected={isSelected}
                            onClick={onSelect}
                        />
                    )}
                />

                <SelectDropdown<SocialAnalyticsTimePeriod>
                    items={socialAnalyticsTimePeriodOptions}
                    selectedItemId={timePeriod}
                    getItemId={(item) => item}
                    onSelect={(item) => setTimePeriod(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={CalendarDaysIcon}
                            label={socialAnalyticsTimePeriodToFrenchTranslation[timePeriod]}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <FilterTile
                            label={socialAnalyticsTimePeriodToFrenchTranslation[item]}
                            isSelected={isSelected}
                            onClick={onSelect}
                        />
                    )}
                />
            </div>

        </div>

        <SocialAnalyticsIntegrationPageView integration={displayedIntegration} />
    </div >;
}
