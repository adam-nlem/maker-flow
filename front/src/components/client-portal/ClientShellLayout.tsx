import { Navigate, Outlet } from "react-router-dom";
import { useIsDesktop } from "~/hooks/useIsDesktop";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import ClientDesktopSidebar from "./sidebar/ClientDesktopSidebar";
import ClientMobileSidebar from "./sidebar/ClientMobileSidebar";
import { agencyHomePath } from "~/routes/routePaths";

export default function ClientShellLayout() {
    const isDesktop = useIsDesktop();
    const { user } = useCurrentUser();

    if (user && !user.isClient) {
        return <Navigate to={agencyHomePath} replace />;
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
