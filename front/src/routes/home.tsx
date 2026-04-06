import HomeInsightsOverview from "~/components/home/HomeInsightsOverview";
import Shimmer from "~/components/ui/Shimmer";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { useFocusIntegrationStore } from "~/stores/integrations/focusIntegrationStore";
import RankedPostsList from "~/components/home/RankedPostsList";
import RankedPostGroupsList from "~/components/home/RankedPostGroupsList";
import HomeScriptsSection from "~/components/home/HomeScriptsSection";
import PremiumPlaceholder from "~/components/ui/PremiumPlaceholder";
import ConnectIntegrationPlaceholder from "~/components/integrations/ConnectIntegrationPlaceholder";
import IntegrationPillRow from "~/components/integrations/IntegrationPillRow";
import { useIsSubscribed } from "~/hooks/useIsSubscribed";
import { useListIntegrations } from "~/hooks/api/integrations/useListIntegrations";

export default function HomePage() {
  const { projects, isLoading } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null
  const focusedIntegrationUuid = useFocusIntegrationStore((state) => state.focusedIntegrationUuid)
  const { isSubscribed } = useIsSubscribed()
  const { integrations } = useListIntegrations({ projectUuid: focusedProjectUuid })

  return (
    <div className="h-full overflow-y-auto md:overflow-hidden">
      <div className="p-3 md:p-5 flex flex-col h-full">
        <div className="flex flex-col md:flex-row gap-3 md:gap-5 flex-1 min-h-0">
          {isLoading ? (
            <>
              <div className="hidden md:block md:w-2/3" />
              <div className="w-full md:w-1/3 flex flex-col gap-3 md:gap-5">
                <div className="flex flex-row flex-wrap gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex flex-row gap-3 border border-light-gray rounded-lg p-2 w-fit items-center">
                      <div className="flex flex-col gap-1">
                        <Shimmer width="w-16" height="h-3" />
                        <Shimmer width="w-10" height="h-4" />
                      </div>
                      <Shimmer width="w-4" height="h-4" />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col">
                  <Shimmer width="w-40" height="h-4" />
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-row gap-3 p-1 border-t border-light-gray items-center">
                      <Shimmer width="w-4" height="h-4" />
                      <Shimmer width="w-10" height="h-10" radius="rounded" />
                      <div className="flex flex-col gap-1">
                        <Shimmer width="w-32" height="h-3" />
                        <Shimmer width="w-20" height="h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : focusedProject && (
            <>
              <div className="w-full md:w-2/3 flex flex-col gap-3 md:gap-5 overflow-y-auto scrollbar-none">
                <HomeScriptsSection projectUuid={focusedProject.uuid} />
              </div>
              <div className="w-full md:w-1/3 flex flex-col gap-3 md:gap-5 min-h-0">
                {integrations.length === 0 ? (
                  <ConnectIntegrationPlaceholder />
                ) : focusedIntegrationUuid === null && !isSubscribed ? (
                  <>
                    <IntegrationPillRow integrations={integrations} />
                    <PremiumPlaceholder isRestricted>
                      <div className="h-96" />
                    </PremiumPlaceholder>
                  </>
                ) : (
                  <>
                    <HomeInsightsOverview projectUuid={focusedProject.uuid} />
                    {focusedIntegrationUuid
                      ? <RankedPostsList integrationUuid={focusedIntegrationUuid} />
                      : <RankedPostGroupsList projectUuid={focusedProject.uuid} />
                    }
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
