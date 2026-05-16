import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import DesktopSidebar from "../sidebar/DesktopSidebar";
import MobileSidebar from "../sidebar/MobileSidebar";
import AgencyTopBar from "../topbar/AgencyTopBar";
import { clientHomePath, onboardingPath } from "~/routes/routePaths";

export default function AgencyShellLayout() {
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    if (user?.isClient) {
        return <Navigate to={clientHomePath} replace />;
    }

    if (user && user.agency === null) {
        return <Navigate to={onboardingPath} replace />;
    }

    return (
        <div className="flex flex-row w-full h-screen">
            {isDesktop && <DesktopSidebar />}
            {!isDesktop && <MobileSidebar />}

            <div className="flex-1 min-w-0 h-full flex flex-col">
                <AgencyTopBar />

                <div className="flex-1 min-h-0 overflow-hidden">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
