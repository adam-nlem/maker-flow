import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowProject } from "~/hooks/api/projects/useShowProject";
import { HttpException } from "~/services/httpClient/HttpException";
import ClientDesktopSidebar from "./sidebar/ClientDesktopSidebar";
import ClientMobileSidebar from "./sidebar/ClientMobileSidebar";
import ClientPortalLockedView from "./ClientPortalLockedView";
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
        <>
            {!isDesktop && <ClientMobileSidebar />}

            <div className="flex w-full h-screen">
                {isDesktop && <ClientDesktopSidebar />}

                <div className={`flex-1 min-w-0 h-full ${isDesktop ? '' : 'pt-12'}`}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
