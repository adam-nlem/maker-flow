import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { agencyHomePath } from "~/routes/routePaths";

export default function ClientShellLayout() {
    const { user } = useCurrentUser();

    if (user && !user.isClient) {
        return <Navigate to={agencyHomePath} replace />;
    }

    return <Outlet />;
}
