import SideBar from "~/components/sidebar/SideBar";
import { useListPaginatedProjects } from "~/hooks/api/projects/useListPaginatedProjects";
import useSelectFocusedProject from "~/hooks/api/projects/useSelectFocusedProject";
import SettingsPageView from "~/components/settings/SettingsPageView";

export default function SettingsPage() {
    const { projects } = useListPaginatedProjects();
    const { focusedProjectUuid } = useSelectFocusedProject({ projects });
    const focusedProject = projects.find((p) => p.uuid === focusedProjectUuid) ?? null;

    return (
        <div className="w-full">
            <SideBar />
            <div className="w-full pl-16">
                <SettingsPageView projectUuid={focusedProject?.uuid ?? null} />
            </div>
        </div>
    );
}
