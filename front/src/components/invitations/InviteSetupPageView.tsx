import { EnvelopeOpenIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline"
import { useTranslation } from "react-i18next"

import AuthStepLayout from "~/components/auth/AuthStepLayout"
import { Button } from "~/components/ui/Button"
import Shimmer from "~/components/ui/Shimmer"
import { useCurrentUser } from "~/hooks/api/users/useCurrentUser"
import { useLogout } from "~/hooks/api/users/useLogout"
import { useShowInvitation } from "~/hooks/api/invitations/useShowInvitation"
import { resolveErrorMessage } from "~/services/apiErrorHandler/errorCodeMessages"
import { InvitationType } from "~/models/enums/InvitationType"
import { userRoleTranslationKeys } from "~/models/enums/UserRole"
import InviteSetupForm from "./InviteSetupForm"

interface InviteSetupPageViewProps {
    token: string
}

export default function InviteSetupPageView({ token }: InviteSetupPageViewProps) {
    const { t } = useTranslation()
    const { user, isLoading: isLoadingUser } = useCurrentUser()
    const { logout, isPending: isLoggingOut } = useLogout()

    const isAuthenticated = !isLoadingUser && user !== null
    const { invitation, isLoading: isLoadingInvitation, error: invitationError } = useShowInvitation(
        !isLoadingUser && !isAuthenticated ? token : null,
    )

    if (isLoadingUser || (!isAuthenticated && isLoadingInvitation)) {
        return (
            <PageBackground>
                <AuthStepLayout icon={EnvelopeOpenIcon} title={t("invitations:setup.loading.title")} subtitle="">
                    <Shimmer width="w-80" height="h-40" radius="rounded-xl" />
                </AuthStepLayout>
            </PageBackground>
        )
    }

    if (isAuthenticated) {
        return (
            <PageBackground>
                <AuthStepLayout
                    icon={EnvelopeOpenIcon}
                    title={t("invitations:setup.alreadyLoggedIn.title")}
                    subtitle={t("invitations:setup.alreadyLoggedIn.subtitle", { email: user.email })}
                >
                    <Button
                        type="button"
                        style="primary"
                        width="w-auto"
                        onClick={logout}
                        isLoading={isLoggingOut}
                        disabled={isLoggingOut}
                    >
                        {t("invitations:setup.alreadyLoggedIn.logout")}
                    </Button>
                </AuthStepLayout>
            </PageBackground>
        )
    }

    if (invitationError || !invitation) {
        return (
            <PageBackground>
                <AuthStepLayout
                    icon={ExclamationCircleIcon}
                    title={t("invitations:setup.error.title")}
                    subtitle={resolveErrorMessage(invitationError)}
                />
            </PageBackground>
        )
    }

    const isClientInvite = invitation.type === InvitationType.Client
    const agencyName = invitation.agency?.name ?? ""
    const roleLabel = invitation.role ? t(userRoleTranslationKeys[invitation.role]) : ""

    const title = isClientInvite
        ? t("invitations:setup.client.title", { agencyName })
        : t("invitations:setup.collaborator.title", { agencyName })

    const subtitle = isClientInvite
        ? t("invitations:setup.client.subtitle")
        : t("invitations:setup.collaborator.subtitle", { role: roleLabel })

    const inviterName = invitation.createdBy?.fullName ?? null

    return (
        <PageBackground>
            <AuthStepLayout
                icon={EnvelopeOpenIcon}
                title={title}
                subtitle={
                    inviterName
                        ? <>{subtitle} <span className="text-dark font-medium">{t("invitations:setup.invitedBy", { name: inviterName })}</span></>
                        : subtitle
                }
            >
                <div className="min-w-sm">
                    <InviteSetupForm token={token} invitation={invitation} />
                </div>
            </AuthStepLayout>
        </PageBackground>
    )
}

function PageBackground({ children }: { children: React.ReactNode }) {
    return <div className="bg-clear bg-dot-pattern min-h-screen relative">{children}</div>
}
