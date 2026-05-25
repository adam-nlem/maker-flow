import { Navigate } from "react-router-dom";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { agencyHomePath, clientHomePath, loginPath } from "~/routes/routePaths";

export default function RootRedirect() {
    const { user, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!user) return <Navigate to={loginPath} replace />;

    return <Navigate to={user.isClient ? clientHomePath : agencyHomePath} replace />;
}
