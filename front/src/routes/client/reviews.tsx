import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ClientReviewsPageView from "~/components/client/reviews/ClientReviewsPageView";

export default function ClientReviewsPage() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    return (
        <div className="h-full">
            {focusedProject && <ClientReviewsPageView projectUuid={focusedProject.uuid} />}
        </div>
    );
}
