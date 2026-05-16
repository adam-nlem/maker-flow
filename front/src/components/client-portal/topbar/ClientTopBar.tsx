import { useLocation } from "react-router-dom";
import AgencyLogo from "~/components/agency/AgencyLogo";
import TopBarShell from "~/components/topbar/TopBarShell";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { clientSettingsPath } from "~/routes/routePaths";
import { clientTopBarActions } from "./clientTopBarActions";

export default function ClientTopBar() {
    const location = useLocation();
    const projectUuid = useFocusProjectStore((s) => s.focusedProjectUuid);
    const { project } = useShowProject(projectUuid);
    const agency = project?.agency ?? null;
    const ActionComponent = clientTopBarActions[location.pathname];

    const brand = agency ? (
        <>
            <AgencyLogo agency={agency} className="size-7 shrink-0" />
            <span className="text-heading-sm text-dark truncate max-w-32 sm:max-w-none hidden sm:inline">
                {agency.name}
            </span>
        </>
    ) : null;

    return (
        <TopBarShell
            brand={brand}
            settingsPath={clientSettingsPath}
            actions={ActionComponent ? <ActionComponent /> : null}
        />
    );
}
