import type { Route } from "./+types/home";
import SideBar from "~/components/sidebar/SideBar";
import HomeInsightsOverview from "~/components/home/HomeInsightsOverview";
import Shimmer from "~/components/ui/Shimmer";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { useHomeFilterStore } from "~/stores/homeFilterStore";
import RankedPostsList from "~/components/home/RankedPostsList";
import RankedPostGroupsList from "~/components/home/RankedPostGroupsList";
import HomeScriptsByStatus from "~/components/home/HomeScriptsByStatus";
import { ScriptCalendar } from "~/components/scripts/calendar";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { projects, isLoading } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null
  const focusedIntegrationUuid = useHomeFilterStore((state) => state.focusedIntegrationUuid)

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16">
        <div className="p-5 flex flex-row gap-5">
          {isLoading ? (
            <>
              <div className="w-2/3" />
              <div className="w-1/3 flex flex-col gap-5">
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
              <div className="w-2/3">
                <ScriptCalendar projectUuid={focusedProject.uuid} />
                {/*                <HomeScriptsByStatus projectUuid={focusedProject.uuid} />*/}
              </div>
              <div className="w-1/3 flex flex-col gap-5">
                <HomeInsightsOverview
                  projectUuid={focusedProject.uuid}
                />
                {focusedIntegrationUuid ? <RankedPostsList integrationUuid={focusedIntegrationUuid} /> : <RankedPostGroupsList projectUuid={focusedProject.uuid} />}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
