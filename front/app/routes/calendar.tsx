import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import { ScriptCalendar } from "~/components/scripts/calendar";
import CalendarFilterPanel from "~/components/scripts/calendar/CalendarFilterPanel";

export default function CalendarPage() {
  const { projects } = useListPaginatedProjects()
  const { focusedProjectUuid } = useSelectFocusedProject({ projects })
  const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null

  return (
    <div className="w-full">
      <SideBar />
      <div className="w-full pl-16">
        <div className="p-5 h-screen overflow-hidden flex flex-col gap-5">

          <h1 className="text-heading-xl">Calendrier</h1>
          {focusedProject && (
            <>
              <CalendarFilterPanel projectUuid={focusedProject.uuid} />
              <ScriptCalendar projectUuid={focusedProject.uuid} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
