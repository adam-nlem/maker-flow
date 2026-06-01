import { Navigate, useParams } from "react-router-dom"
import InviteSetupPageView from "~/components/invitations/InviteSetupPageView"
import { loginPath } from "~/routes/routePaths"

export default function InviteTokenPage() {
    const { token } = useParams()

    if (!token) {
        return <Navigate to={loginPath} replace />
    }

    return <InviteSetupPageView token={token} />
}
