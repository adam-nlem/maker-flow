import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ReviewsPageView from "~/components/agency/reviews/ReviewsPageView";

export default function AgencyReviewsPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="h-full">
      {focusedProject && (
        <ReviewsPageView projectUuid={focusedProject.uuid} />
      )}
    </div>
  );
}
