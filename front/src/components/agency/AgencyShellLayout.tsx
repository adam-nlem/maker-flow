import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import DesktopSidebar from "../sidebar/DesktopSidebar";
import MobileSidebar from "../sidebar/MobileSidebar";
import { clientHomePath } from "~/routes/routePaths";

export default function AgencyShellLayout() {
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    if (user?.isClient) {
        return <Navigate to={clientHomePath} replace />;
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
