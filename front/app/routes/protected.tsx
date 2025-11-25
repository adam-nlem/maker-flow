import { Outlet, useLocation, useNavigate } from "react-router";
import { useAuth } from "~/context/AuthContext";
import { useRef, useEffect } from "react";

export default function ProtectedLayout() {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    // Use ref to track if we've already initiated a redirect
    const hasRedirected = useRef(false);

    // Handle navigation and auth state changes
    useEffect(() => {
        // Only proceed if we're not in a loading state
        if (!isLoading) {
            // If user is logged in, reset redirect flag
            if (user) {
                hasRedirected.current = false;
            }
            // If not authenticated and not already redirecting, redirect to signin
            else if (!hasRedirected.current) {
                hasRedirected.current = true;
                navigate('/login', { state: { from: location.pathname }, replace: true });
            }
        }
    }, [user, isLoading, navigate, location.pathname]);

    // If we're authenticated, render the outlet
    if (user) {
        return <Outlet />;
    }

    // If we're not authenticated but already redirecting, show loading
    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
    );
}
