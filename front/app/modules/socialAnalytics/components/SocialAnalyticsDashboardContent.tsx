import { ChartBarSquareIcon, CalendarDaysIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline"
import type { Integration } from "~/models/Integration"
import SelectDropdown from "~/components/ui/SelectDropdown"
import { useSocialAnalyticsFilterStore } from "../stores/socialAnalyticsFilterStore"
import { SocialAnalyticsMetric, socialAnalyticsMetricToFrenchTranslation } from "../models/enums/SocialAnalyticsMetric"
import { SocialAnalyticsTimePeriod, socialAnalyticsTimePeriodToFrenchTranslation } from "../models/enums/SocialAnalyticsTimePeriod"
import FilterTile from "./FilterTile"

interface SocialAnalyticsDashboardContentProps {
    userModuleUuid: string
    integrations: Integration[]
}

const metricOptions = Object.values(SocialAnalyticsMetric)
const timePeriodOptions = Object.values(SocialAnalyticsTimePeriod)

export default function SocialAnalyticsDashboardContent({
    userModuleUuid,
    integrations,
}: SocialAnalyticsDashboardContentProps) {
    const { metric, timePeriod, setMetric, setTimePeriod } = useSocialAnalyticsFilterStore()

    return (
        <div className="m-5 w-1/3 h-[50vh] flex flex-col gap-3">
            <div className="flex flex-row gap-3 items-center shrink-0">
                <SelectDropdown<SocialAnalyticsMetric>
                    items={metricOptions}
                    selectedItemId={metric}
                    getItemId={(item) => item}
                    onSelect={(item) => setMetric(item)}
                    renderTrigger={({ onClick }) => (
                        <FilterTile
                            icon={ChartBarSquareIcon}
                            label={socialAnalyticsMetricToFrenchTranslation[metric]}
                            rightIcon={<ChevronUpDownIcon className="size-5 text-dark -mb-0.5" strokeWidth={2} />}
                            onClick={onClick}
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) => (
                        <FilterTile
                            label={socialAnalyticsMetricToFrenchTranslation[item]}
                            isSelected={isSelected}
                            onClick={onSelect}
                        />
                    )}
                />
                <SelectDropdown<SocialAnalyticsTimePeriod>
                    items={timePeriodOptions}
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

            <div className="flex flex-col items-center justify-center h-full gap-4">
                <h2 className="text-heading-lg text-primary">Social Analytics</h2>
                <p className="text-body-md text-secondary">
                    {integrations.length} account(s) connected
                </p>
                <p className="text-body-sm text-gray">
                    Dashboard content coming soon...
                </p>
            </div>
        </div>
    )
}
