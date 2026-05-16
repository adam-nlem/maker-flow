import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import ScriptPageView from "~/components/agency/scripts/ScriptPageView";

export default function AgencyScriptsPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <>
      {focusedProject && (
        <ScriptPageView projectUuid={focusedProject.uuid} />
      )}
    </>
  );
}
