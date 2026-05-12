import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import HomeEngagementChart from "~/components/home/HomeEngagementChart";
import HomeOverviewCards from "~/components/home/HomeOverviewCards";
import HomeViewsEvolutionChart from "~/components/home/HomeViewsEvolutionChart";
import ConnectIntegrationPlaceholder from "~/components/integrations/ConnectIntegrationPlaceholder";
import IntegrationDetailCardRow from "~/components/integrations/IntegrationDetailCardRow";
import Pill from "~/components/ui/Pill";
import SelectDropdown from "~/components/ui/SelectDropdown";
import Shimmer from "~/components/ui/Shimmer";
import { useListIntegrationInsights } from "~/hooks/api/integrationInsights/useListIntegrationInsights";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { timePeriodOptions, timePeriodTranslationKeys } from "~/models/enums/TimePeriod";
import { useHomePeriodStore } from "~/stores/home/homePeriodStore";

export default function ClientHomePage() {
    const { t } = useTranslation();
    const { user } = useCurrentUser();
    const projectUuid = user?.clientProjectUuid ?? null;

    const timePeriod = useHomePeriodStore((state) => state.timePeriod);
    const setTimePeriod = useHomePeriodStore((state) => state.setTimePeriod);

    const { integrations, isLoading: isLoadingIntegrations } = useListIntegrations({ projectUuid });
    const { integrationInsights, isLoading: isLoadingInsights } = useListIntegrationInsights({
        projectUuid,
        timePeriod,
    });

    if (isLoadingIntegrations || isLoadingInsights) {
        return (
            <div className="h-full flex flex-col gap-5 overflow-y-auto p-3 md:p-5">
                <Shimmer width="w-28" height="h-8" radius="rounded-full" />
                <div className="flex flex-row flex-wrap gap-3">
                    {[...Array(3)].map((_, i) => (
                        <Shimmer key={i} width="w-50" height="h-32" radius="rounded-lg" />
                    ))}
                </div>
                <Shimmer width="w-full" height="h-72" radius="rounded-lg" />
                <Shimmer width="w-full" height="h-72" radius="rounded-lg" />
            </div>
        );
    }

    if (integrations.length === 0) {
        return (
            <div className="h-full overflow-y-auto p-3 md:p-5">
                <ConnectIntegrationPlaceholder projectUuid={projectUuid} />
            </div>
        );
    }

    const groups = integrationInsights?.groups ?? [];

    return (
        <div className="h-full flex flex-col gap-3 overflow-y-auto p-3 md:p-5">
            <div className="flex flex-row gap-3">
                <SelectDropdown
                    items={timePeriodOptions}
                    selectedItemId={timePeriod}
                    getItemId={(period) => period}
                    onSelect={(period) => setTimePeriod(period)}
                    renderTrigger={({ onClick }) => (
                        <Pill
                            icon={ChevronUpDownIcon}
                            label={t(timePeriodTranslationKeys[timePeriod])}
                            isSelected
                            onClick={onClick}
                            borderColorClassName="border-light-gray"
                        />
                    )}
                    renderItem={({ item, isSelected, onSelect }) =>
                        !isSelected ? (
                            <Pill
                                label={t(timePeriodTranslationKeys[item])}
                                isSelected
                                onClick={onSelect}
                                borderColorClassName="border-light-gray"
                            />
                        ) : null
                    }
                />
            </div>

            <HomeOverviewCards overview={integrationInsights?.overview ?? null} />
            <IntegrationDetailCardRow groups={groups} />
            <HomeViewsEvolutionChart viewsTimeline={integrationInsights?.viewsTimeline ?? []} />
            <HomeEngagementChart groups={groups} />
        </div>
    );
}
