import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ClientPostDraftsPageView from "~/components/client/postDrafts/ClientPostDraftsPageView";

export default function ClientDraftsPage() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    return (
        <div className="h-full">
            {focusedProject && <ClientPostDraftsPageView projectUuid={focusedProject.uuid} />}
        </div>
    );
}
