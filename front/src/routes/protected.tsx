import { Outlet, useNavigate } from "react-router-dom";
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser";
import { useShowOnboarding } from "~/hooks/api/onboarding/useShowOnboarding";
import useSyncFocusedProject from "~/hooks/api/projects/useSyncFocusedProject";
import { useRef, useEffect } from "react";
import { useAuthPrefillStore } from "~/stores/auth/authPrefillStore";
import { loginPath, onboardingPath } from "~/routes/routePaths";

export default function ProtectedLayout() {
    const { user, isLoading } = useCurrentUser()
    const { onboarding, isLoading: onboardingLoading } = useShowOnboarding({ enabled: !!user })
    useSyncFocusedProject()
    const navigate = useNavigate();
    const hasRedirected = useRef(false);

    useEffect(() => {
        if (isLoading) return

        if (!user) {
            if (!hasRedirected.current) {
                hasRedirected.current = true
                const hasEmail = useAuthPrefillStore.getState().email !== null
                navigate(hasEmail ? loginPath : onboardingPath, { replace: true })
            }
            return
        }

        hasRedirected.current = false

        if (!onboardingLoading && onboarding && !onboarding.isDismissed) {
            navigate(onboardingPath, { replace: true })
        }
    }, [user, isLoading, onboarding, onboardingLoading, navigate])

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
