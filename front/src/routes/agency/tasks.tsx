import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import TodoListDashboardView from "~/components/tasks/TodoListDashboardView";

export default function AgencyTasksPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <>
      {focusedProject && (
        <TodoListDashboardView projectUuid={focusedProject.uuid} />
      )}
    </>
  );
}
