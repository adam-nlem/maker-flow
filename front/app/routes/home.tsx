import type { Route } from "./+types/home";
import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import TodoListDashboardView from "~/components/tasks/TodoListDashboardView";
import InsightsDashboardView from "~/components/insights/InsightsDashboardView";
import { ScriptCalendar } from "~/components/scripts/calendar";
import type { Project } from "~/models/Project";
import { useListPaginatedScripts } from "~/hooks/api/scripts/useListPaginatedScripts";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Maker Flow - Dashboard" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: context.VALUE_FROM_EXPRESS };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null


  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16 flex flex-row flex-wrap">
        {focusedProject && (
          <>
            <Test project={focusedProject} />

            <TodoListDashboardView projectUuid={focusedProject.uuid} />
            <InsightsDashboardView projectUuid={focusedProject.uuid} />
          </>
        )}
      </div>
    </div>
  );
}

function Test({ project }: {
  project: Project | null
}) {
  if (project === null) return
  const { scripts, hasMore, isLoadingMore, listMore } = useListPaginatedScripts({ projectUuid: project.uuid });
  return <ScriptCalendar scripts={scripts} projectUuid={project.uuid} />
}