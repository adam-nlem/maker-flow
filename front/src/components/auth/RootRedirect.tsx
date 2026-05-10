import { Navigate } from "react-router-dom";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { agencyHomePath, clientHomePath } from "~/routes/routePaths";

export default function RootRedirect() {
    const { user } = useCurrentUser();

    if (!user) return null;

    return <Navigate to={user.isClient ? clientHomePath : agencyHomePath} replace />;
}
