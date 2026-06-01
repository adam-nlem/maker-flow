import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { HttpException } from "~/services/httpClient/HttpException";
import ClientDesktopSidebar from "./sidebar/ClientDesktopSidebar";
import ClientMobileSidebar from "./sidebar/ClientMobileSidebar";
import ClientPortalLockedView from "./ClientPortalLockedView";
import ClientTopBar from "./topbar/ClientTopBar";
import { useFocusProjectStore } from "~/stores/project/focusProjectStore";
import { agencyHomePath } from "~/routes/routePaths";

const AGENCY_SUBSCRIPTION_INACTIVE_CODE = 27003;

export default function ClientShellLayout() {
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();
    const projectUuid = useFocusProjectStore((state) => state.focusedProjectUuid);
    const { error: projectError } = useShowProject(projectUuid);

    if (user && !user.isClient) {
        return <Navigate to={agencyHomePath} replace />;
    }

    if (projectError instanceof HttpException && projectError.response.code === AGENCY_SUBSCRIPTION_INACTIVE_CODE) {
        return <ClientPortalLockedView />;
    }

    return (
        <div className="flex flex-row w-full h-screen">
            {isDesktop && <ClientDesktopSidebar />}
            {!isDesktop && <ClientMobileSidebar />}

            <div className="flex-1 min-w-0 h-full flex flex-col">
                <ClientTopBar />

                <div className="flex-1 min-h-0 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
