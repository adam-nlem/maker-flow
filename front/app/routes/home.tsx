import type { Route } from "./+types/home";
import SideBar from "~/components/sidebar/SideBar";
import HomeInsightsOverview from "~/components/home/HomeInsightsOverview";
import HomeRankContent from "~/components/home/HomeRankContent";
import { useListIntegrationInsights } from "~/hooks/api/integrationInsights/useListIntegrationInsights";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  const { insightsOverview } = useListIntegrationInsights({ projectUuid: focusedProject?.uuid ?? "" })

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16 p-5 flex flex-row gap-5">
        {focusedProject && (
          <>
            <div className="w-2/3">
              <HomeRankContent projectUuid={focusedProject.uuid} />
            </div>
            <div className="w-1/3">
              <HomeInsightsOverview
                insightsOverview={insightsOverview}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}