import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import PostDraftsPageView from "~/components/postDrafts/PostDraftsPageView";

export default function AgencyDraftsPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="h-full">
      {focusedProject && (
        <PostDraftsPageView projectUuid={focusedProject.uuid} />
      )}
    </div>
  );
}
