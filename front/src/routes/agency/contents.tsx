import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ContentsPageView from "~/components/contents/ContentsPageView";

export default function AgencyContentsPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="h-full">
      {focusedProject && (
        <ContentsPageView projectUuid={focusedProject.uuid} />
      )}
    </div>
  );
}
