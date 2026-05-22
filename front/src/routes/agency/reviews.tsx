import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import AgencyReviewsPage from "~/components/agency/reviews/AgencyReviewsPage";

export default function AgencyReviewsRoute() {
  const { projects } = useListPaginatedProjects();
  const { focusedProjectUuid } = useSelectFocusedProject({ projects });
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

  return (
    <div className="h-full">
      {focusedProject && <AgencyReviewsPage projectUuid={focusedProject.uuid} />}
    </div>
  );
}
