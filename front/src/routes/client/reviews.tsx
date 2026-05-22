import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ClientReviewsPage from "~/components/client/reviews/ClientReviewsPage";

export default function ClientReviewsRoute() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    return (
        <div className="h-full">
            {focusedProject && <ClientReviewsPage projectUuid={focusedProject.uuid} />}
        </div>
    );
}
