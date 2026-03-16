import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import PrelaunchAuthenticateStep from "~/components/prelaunch/PrelaunchAuthenticateStep"
import PrelaunchDashboard from "~/components/prelaunch/PrelaunchDashboard"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { homePath } from "~/routes/routePaths"

export default function PrelaunchPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const isPrelaunchEnabled = import.meta.env.VITE_PRELAUNCH_ENABLED === 'true'
    const { user, isLoading } = useCurrentUser()

    useEffect(() => {
        if (!isPrelaunchEnabled) {
            navigate(homePath, { replace: true })
        }
    }, [isPrelaunchEnabled, navigate])

    if (!isPrelaunchEnabled || isLoading) return null

    const refCode = searchParams.get('ref')

    return (
        <div className="bg-clear bg-dot-pattern h-screen overflow-y-auto relative scrollbar-none">
            {user?.referralCode ? <PrelaunchDashboard referralCode={user.referralCode} /> : <PrelaunchAuthenticateStep referralCodeFromUrl={refCode} />}
        </div>
    )
}
