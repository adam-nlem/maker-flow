import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ContentPageView from "~/components/content/ContentPageView";

export default function ContentPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="flex w-full">
      <SideBar />
      <div className="flex-1 min-w-0 h-screen">
        {focusedProject && (
          <ContentPageView projectUuid={focusedProject.uuid} />
        )}
      </div>
    </div>
  );
}
