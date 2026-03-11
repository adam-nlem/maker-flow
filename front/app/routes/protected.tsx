import { Outlet, useLocation, useNavigate } from "react-router";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding";
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore";
import { useRef, useEffect } from "react";

export default function ProtectedLayout() {
    const { user, isLoading } = useCurrentUser()
    const { onboarding, isLoading: onboardingLoading } = useShowOnboarding({ enabled: !!user })
    const location = useLocation();
    const navigate = useNavigate();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                hasRedirected.current = false;
            }
            else if (!hasRedirected.current) {
                hasRedirected.current = true;
                const prefillEmail = useAuthPrefillStore.getState().email;
                if (prefillEmail) {
                    navigate('/login', { state: { from: location.pathname }, replace: true });
                } else {
                    navigate('/onboarding', { replace: true });
                }
            }
        }
    }, [user, isLoading, navigate, location.pathname]);

    useEffect(() => {
        if (user && !onboardingLoading && onboarding && !onboarding.isDismissed) {
            navigate('/onboarding', { replace: true });
        }
    }, [user, onboarding, onboardingLoading, navigate]);

    if (user) {
        if (onboardingLoading || (onboarding && !onboarding.isDismissed)) {
            return (
                <div className="flex min-h-screen items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
            );
        }
        return <Outlet />;
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
    );
}
