import Shimmer from "~/components/ui/Shimmer";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { useIsSubscribed } from "~/hooks/useIsSubscribed";
import { useListIntegrationInsights } from "~/hooks/api/integrationInsights/useListIntegrationInsights";
import { useHomePeriodStore } from "~/stores/home/homePeriodStore";
import PremiumPlaceholder from "~/components/ui/PremiumPlaceholder";
import HomeOverviewCards from "~/components/home/HomeOverviewCards";
import HomeViewsEvolutionChart from "~/components/home/HomeViewsEvolutionChart";
import HomeEngagementChart from "~/components/home/HomeEngagementChart";
import { useTranslation } from "react-i18next";
import { timePeriodOptions, timePeriodTranslationKeys } from "~/models/enums/TimePeriod";
import Pill from "~/components/ui/Pill";
import SelectDropdown from "~/components/ui/SelectDropdown";
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";
import IntegrationDetailCardRow from "~/components/integrations/IntegrationDetailCardRow";
import HomeScriptsPanel from "~/components/agency/home/HomeScriptsPanel";
import HomePendingReviewCommentsPanel from "~/components/agency/home/HomePendingReviewCommentsPanel";

export default function AgencyHomePage() {
  const { t } = useTranslation();
  const { projects, isLoading } = useListPaginatedProjects();
  const { focusedProjectUuid } = useSelectFocusedProject({ projects });
  const { isSubscribed } = useIsSubscribed();
  const timePeriod = useHomePeriodStore((state) => state.timePeriod);
  const setTimePeriod = useHomePeriodStore((state) => state.setTimePeriod);
  const { integrationInsights } = useListIntegrationInsights({
    projectUuid: focusedProjectUuid,
    timePeriod,
  });

  if (isLoading) {
    return (
      <div className="h-full flex flex-col md:flex-row gap-3 overflow-y-auto p-3 md:p-5">
        <div className="flex flex-col gap-5 flex-1 min-w-0">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center gap-3">
              <Shimmer width="w-10" height="h-10" radius="rounded-full" />
              <Shimmer width="w-32" height="h-5" />
            </div>
            <div className="flex flex-row gap-2">
              <Shimmer width="w-28" height="h-8" radius="rounded-full" />
              <Shimmer width="w-20" height="h-8" radius="rounded-full" />
            </div>
          </div>
          <div className="flex flex-row flex-wrap gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-row gap-2 border border-pale-gray rounded-lg px-3 py-2 items-center">
                <Shimmer width="w-5" height="h-5" radius="rounded-md" />
                <Shimmer width="w-7" height="h-7" radius="rounded-full" />
                <Shimmer width="w-20" height="h-3" />
                <Shimmer width="w-2" height="h-2" radius="rounded-full" />
              </div>
            ))}
          </div>
          <Shimmer width="w-full" height="h-72" radius="rounded-lg" />
        </div>
        <div className="w-full md:w-1/2 shrink-0 flex flex-col gap-3">
          <Shimmer width="w-full" height="h-96" radius="rounded-lg" />
          <Shimmer width="w-full" height="h-96" radius="rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="h-full overflow-y-auto p-3 md:p-5">
        <PremiumPlaceholder isRestricted>
          <div className="h-96" />
        </PremiumPlaceholder>
      </div>
    );
  }

  const groups = integrationInsights?.groups ?? [];

  return (
    <div className="h-full flex flex-col md:flex-row gap-3 overflow-y-auto p-3 md:p-5">
      <div className="flex flex-col gap-3 md:justify-between flex-1 min-w-0">
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
                borderColorClassName="border-pale-gray"
              />
            )}
            renderItem={({ item, isSelected, onSelect }) => {
              return !isSelected ? <Pill
                label={t(timePeriodTranslationKeys[item])}
                isSelected
                onClick={onSelect}
                borderColorClassName="border-pale-gray"
              /> : null
            }}
          />
        </div>
        <HomeOverviewCards overview={integrationInsights?.overview ?? null} />
        <IntegrationDetailCardRow groups={groups} projectUuid={focusedProjectUuid} />


        <HomeViewsEvolutionChart viewsTimeline={integrationInsights?.viewsTimeline ?? []} />
        <HomeEngagementChart groups={groups} />
      </div>

      {focusedProjectUuid && (
        <div className="w-full md:w-1/2 shrink-0 flex flex-col gap-3 min-h-0">
          <HomeScriptsPanel projectUuid={focusedProjectUuid} />
          <HomePendingReviewCommentsPanel projectUuid={focusedProjectUuid} />
        </div>
      )}
    </div>
  );
}
