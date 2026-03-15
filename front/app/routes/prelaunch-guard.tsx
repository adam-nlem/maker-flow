import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { prelaunchPath } from "~/routes/routePaths";

export default function PrelaunchGuardLayout() {
    const navigate = useNavigate()
    const isPrelaunchEnabled = import.meta.env.VITE_PRELAUNCH_ENABLED === 'true'

    useEffect(() => {
        if (isPrelaunchEnabled) {
            navigate(prelaunchPath, { replace: true })
        }
    }, [isPrelaunchEnabled, navigate])

    if (isPrelaunchEnabled) return null

    return <Outlet />
}
