import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useApplyAgencyTheme } from "~/hooks/useApplyAgencyTheme";
import DesktopSidebar from "../sidebar/DesktopSidebar";
import MobileSidebar from "../sidebar/MobileSidebar";
import { clientHomePath, onboardingPath } from "~/routes/routePaths";

export default function AgencyShellLayout() {
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    useApplyAgencyTheme(user?.agency);

    if (user?.isClient) {
        return <Navigate to={clientHomePath} replace />;
    }

    if (user && user.agency === null) {
        return <Navigate to={onboardingPath} replace />;
    }

    return (
        <>
            {!isDesktop && <MobileSidebar />}

            <div className="flex w-full h-screen">
                {isDesktop && <DesktopSidebar />}

                <div className={`flex-1 min-w-0 h-full ${isDesktop ? '' : 'pt-12'}`}>
                    <Outlet />
                </div>
            </div>
        </>
    );
}
