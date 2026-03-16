import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import InsightsPageView from "~/components/insights/InsightsPageView";

export default function InsightsPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16">
        {focusedProject && (
          <InsightsPageView projectUuid={focusedProject.uuid} />
        )}
      </div>
    </div>
  );
}
